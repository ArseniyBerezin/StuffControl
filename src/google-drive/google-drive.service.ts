import { Injectable } from '@nestjs/common'
import { drive_v3, google } from 'googleapis'
import { FRACTION_TABLES } from 'src/config/fraction-tables.config'
import { GOOGLE_DRIVE_CONFIG } from 'src/config/google-drive.config'

@Injectable()
export class GoogleDriveService {
	private drive: drive_v3.Drive

	constructor() {
		const auth = new google.auth.GoogleAuth({
			keyFile: GOOGLE_DRIVE_CONFIG.keyFile,
			scopes: GOOGLE_DRIVE_CONFIG.scopes
		})

		this.drive = google.drive({ version: 'v3', auth })
	}

	async giveAccessByFraction(
		fraction: string,
		email: string,
		role: string = 'writer'
	) {
		const fileIds = FRACTION_TABLES[fraction]

		if (!fileIds || fileIds.length === 0) {
			throw new Error(`No tables found for fraction: ${fraction}`)
		}

		const results = []
		for (const fileId of fileIds) {
			try {
				const response = await this.giveAccess(fileId, email, role)
				results.push(response)
			} catch (error) {
				console.error(
					`Failed to give access to file ${fileId}: ${error.message}`
				)
				results.push({ fileId, error: error.message })
			}
		}
		return results
	}

	async giveAccess(fileId: string, email: string, role: string = 'writer') {
		try {
			const response = await this.drive.permissions.create({
				fileId,
				requestBody: {
					role,
					type: 'user',
					emailAddress: email
				}
			})
			return response.data
		} catch (error) {
			throw new Error(`Failed to give access: ${error.message}`)
		}
	}

	async revokeAccessByFraction(fraction: string, email: string) {
		const fileIds = FRACTION_TABLES[fraction]

		if (!fileIds || fileIds.length === 0) {
			throw new Error(`No tables found for fraction: ${fraction}`)
		}

		const results = []
		for (const fileId of fileIds) {
			try {
				const permissions = await this.drive.permissions.list({
					fileId,
					fields: 'permissions(id, emailAddress)'
				})

				const permission = permissions.data.permissions?.find(
					p => p.emailAddress === email
				)

				if (permission) {
					await this.drive.permissions.delete({
						fileId,
						permissionId: permission.id
					})
					results.push({ fileId, status: 'revoked' })
				} else {
					results.push({ fileId, status: 'not_found' })
				}
			} catch (error) {
				console.error(
					`Failed to revoke access to file ${fileId}: ${error.message}`
				)
				results.push({ fileId, error: error.message })
			}
		}
		return results
	}

	async listPermissions(fileId: string) {
		try {
			const response = await this.drive.permissions.list({
				fileId
			})
			return response.data.permissions
		} catch (error) {
			throw new Error(`Failed to list permissions: ${error.message}`)
		}
	}

	async findPermissionIdByEmail(
		fileId: string,
		email: string
	): Promise<string | null> {
		const permissions = await this.listPermissions(fileId)
		const permission = permissions.find(p => p.emailAddress === email)
		return permission ? permission.id : null
	}
}
