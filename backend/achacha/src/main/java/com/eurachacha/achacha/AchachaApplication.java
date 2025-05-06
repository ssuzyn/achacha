package com.eurachacha.achacha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.eurachacha.achacha.infrastructure.config.AIServiceProperties;
import com.eurachacha.achacha.infrastructure.config.AwsCloudFrontProperties;
import com.eurachacha.achacha.infrastructure.config.AwsS3Properties;
import com.eurachacha.achacha.infrastructure.config.ClovaOcrProperties;

@SpringBootApplication
@EnableConfigurationProperties({ClovaOcrProperties.class, AIServiceProperties.class,
	AwsS3Properties.class, AwsCloudFrontProperties.class})
public class AchachaApplication {

	public static void main(String[] args) {
		SpringApplication.run(AchachaApplication.class, args);
	}

}
