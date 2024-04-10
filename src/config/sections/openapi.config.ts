import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export async function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('NAME')
        .setDescription('DESCRIPTION')
        .setVersion('1.0')
        .setContact('White Hat', '', 'nhatminh772002@gmail.com')
        .addBearerAuth()
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(process.env.VERSION, app, document, {
        customfavIcon: 'https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_swagger_icon_130134.png',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
        ],
    })
}