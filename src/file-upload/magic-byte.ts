export type Signature = {
	offset: number;
	bytes: number[];
};

export enum FileFormats {
	JPEG = "image/jpeg",
	JPG = "image/jpg",
	PNG = "image/png",
	PDF = "application/pdf"
}

export class FileSignatureValidator {
	// Negative offset means offset from end of file
	private static jpegSignatures: Signature[] = [
		{ offset: 0, bytes: [0xff, 0xd8] },
		{ offset: -2, bytes: [0xff, 0xd9] }
	];

	private static pdfSignatures: Signature[] = [
		{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }
	];

	private static pdfOneOfSignatures: Signature[] = [
		{ offset: -5, bytes: [0x25, 0x25, 0x45, 0x4f, 0x46] },
		{ offset: -6, bytes: [0x25, 0x25, 0x45, 0x4f, 0x46] },
		{ offset: -9, bytes: [0x0d, 0x0a, 0x25, 0x25, 0x45, 0x4F, 0x46, 0x0D, 0x0A] },
	];

	// private static pngSignatures: Signature[] = [
	// 	{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
	// 	{ offset: -8, bytes: [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82] },
	// ];

	private static match = (buffer: Buffer, signatures: Signature[], oneOfSignature: Signature[] = []): boolean => {
		let valid: boolean = true;
		let oneOfValid: boolean = true;

		signatures.forEach(({ offset, bytes }): void => {
			const o = offset < 0 ? buffer.length + offset : offset;

			const hasMatch = bytes.some((byte: number, idx: number) => {
				return byte !== buffer[idx + o];
			});

			if (hasMatch) {
				valid = false;
			}
		});

		if (oneOfSignature.length > 0) {
			oneOfValid = oneOfSignature.some(({ offset, bytes }) => {
				const o = offset < 0 ? buffer.length + offset : offset;

				return bytes.some((byte: number, idx: number) => {
					return byte !== buffer[idx + o];
				});
			});
		}

		return valid && oneOfValid;
	};

	private static readFromBase64(srcStr: string, numBytes = 0): Buffer {
		return numBytes === 0
			? Buffer.from(srcStr, "base64")
			: Buffer.alloc(numBytes, srcStr, "base64");
	}

	private static validateBase64(file: string, signature: Signature[], oneOfSignature?: Signature[]): boolean {
		const buff: Buffer = FileSignatureValidator.readFromBase64(file);
		return FileSignatureValidator.match(buff, signature, oneOfSignature);
	}

	/**
	 * get magic bytes signature for specified file format
	 * @param {FileFormats} format format to get signature for
	 * @return {Signature} returns the magic bytes signature for specified format
	 */
	private static getSignatures(format: FileFormats): Signature[] {
		switch (format.toLowerCase()) {
			// case FileFormats.PNG:
			// 	return FileSignatureValidator.pngSignatures;
			case FileFormats.PDF:
				return FileSignatureValidator.pdfSignatures;
			default:
				return FileSignatureValidator.jpegSignatures;
		}
	}

	private static getOneOfSignatures(format: FileFormats): Signature[] | undefined {
		if (format.toLowerCase() === FileFormats.PDF) {
			return FileSignatureValidator.pdfOneOfSignatures;
		}
		return undefined;
	}


	/**
	 * Reads file from filePath and returns true if file's magic bytes matches the signature of the specified format
	 * @param {string} base64Str base64 encoded image file
	 * @param {FileFormats} format format to validate for
	 * @returns {boolean} returns true if magic bytes matches signature of specified format
	 *  1) specified format is unsupported,
	 *  2) opening/reading specified file fails, or
	 *  3) file data does not match specified file signature
	 */
	public static validateBytes(base64: string, format: FileFormats): boolean {
		const signature = FileSignatureValidator.getSignatures(format);
		const oneOfSignature = FileSignatureValidator.getOneOfSignatures(format);
		return FileSignatureValidator.validateBase64(base64, signature, oneOfSignature);
	}
}