package com.eurachacha.achacha.infrastructure.adapter.output.storage;

import java.io.IOException;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.domain.model.gifticon.enums.FileType;
import com.eurachacha.achacha.infrastructure.config.AwsCloudFrontProperties;
import com.eurachacha.achacha.infrastructure.config.AwsS3Properties;
import com.eurachacha.achacha.infrastructure.config.CloudFrontConfig;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class S3StorageAdapter implements FileStoragePort {

	private final AmazonS3 amazonS3;
	private final CloudFrontConfig.CloudFrontSigner cloudFrontSigner;
	private final AwsS3Properties awsS3Properties;
	private final AwsCloudFrontProperties cloudFrontProperties;

	@Override
	public String uploadFile(MultipartFile file, FileType fileType, Integer entityId) {
		try {
			// 파일명만 생성 (경로 제외)
			String fileName = entityId + "_" + UUID.randomUUID() + "." + getExtension(file.getOriginalFilename());
			// S3에 업로드할 전체 경로 구성
			String fullPath = fileType.getPathPrefix() + "/" + fileName;

			ObjectMetadata metadata = new ObjectMetadata();
			metadata.setContentType(file.getContentType());
			metadata.setContentLength(file.getSize());

			amazonS3.putObject(new PutObjectRequest(
				awsS3Properties.getBucket(),
				fullPath, // 전체 경로로 S3에 저장
				file.getInputStream(),
				metadata
			).withCannedAcl(CannedAccessControlList.Private));

			return fileName; // DB에는 파일명만 반환
		} catch (IOException e) {
			throw new RuntimeException("Failed to upload file to S3", e);
		}
	}

	@Override
	public String generateFileUrl(String fileName, FileType fileType, long expirationTimeInMillis) {
		String fullPath = fileType.getPathPrefix() + "/" + fileName;
		String resourceUrl = "https://" + cloudFrontProperties.getDomain() + "/" + fullPath;
		Date expirationDate = new Date(System.currentTimeMillis() + expirationTimeInMillis);

		return cloudFrontSigner.generateSignedUrl(resourceUrl, expirationDate);
	}

	@Override
	public void deleteFile(String fileName, FileType fileType) {
		// 파일명과 파일 타입으로 전체 경로 구성
		String fullPath = fileType.getPathPrefix() + "/" + fileName;
		amazonS3.deleteObject(awsS3Properties.getBucket(), fullPath);
	}

	private String getExtension(String filename) {
		if (filename == null || filename.lastIndexOf(".") == -1) {
			return "jpg";
		}
		return filename.substring(filename.lastIndexOf(".") + 1);
	}
}
