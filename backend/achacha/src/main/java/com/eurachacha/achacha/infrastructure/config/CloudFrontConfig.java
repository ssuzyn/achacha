package com.eurachacha.achacha.infrastructure.config;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.services.cloudfront.CloudFrontUrlSigner;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CloudFrontConfig {

	private final AwsCloudFrontProperties cloudFrontProperties;

	@Bean
	public CloudFrontSigner cloudFrontSigner() {
		if (cloudFrontProperties.getPrivateKey() == null || cloudFrontProperties.getPrivateKey().isEmpty()) {
			throw new IllegalStateException("CloudFront private key is not configured");
		}

		try {
			// Base64 디코딩 후, DER 형식으로 SignedURL 생성
			byte[] privateKeyBytes = Base64.getDecoder().decode(cloudFrontProperties.getPrivateKey());
			return new CloudFrontSigner(
				cloudFrontProperties.getKeypairId(),
				privateKeyBytes
			);
		} catch (Exception e) {
			throw new RuntimeException("Failed to initialize CloudFront signer", e);
		}
	}

	// CloudFront Signer 클래스 정의
	public static class CloudFrontSigner {
		private final String keyPairId;
		private final byte[] privateKeyBytes;

		public CloudFrontSigner(String keyPairId, byte[] privateKeyBytes) {
			this.keyPairId = keyPairId;
			this.privateKeyBytes = privateKeyBytes;
		}

		public String generateSignedUrl(String resourcePath, Date expirationDate) {
			try {
				PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
				KeyFactory keyFactory = KeyFactory.getInstance("RSA");
				PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

				return CloudFrontUrlSigner.getSignedURLWithCannedPolicy(
					resourcePath, keyPairId, privateKey, expirationDate);
			} catch (Exception e) {
				throw new RuntimeException("Failed to generate signed URL", e);
			}
		}
	}
}
