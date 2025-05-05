package com.eurachacha.achacha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.eurachacha.achacha.infrastructure.config.ClovaOcrProperties;

@SpringBootApplication
@EnableConfigurationProperties({ClovaOcrProperties.class})
public class AchachaApplication {

	public static void main(String[] args) {
		SpringApplication.run(AchachaApplication.class, args);
	}

}
