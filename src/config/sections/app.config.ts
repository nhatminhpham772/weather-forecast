import { INestApplication, ValidationPipe } from "@nestjs/common";
import helmet from "helmet";

export async function setupApp(app: INestApplication) {
    //global prefix
    app.setGlobalPrefix(process.env.VERSION)

    //format respone error (without 500)
    app.useGlobalPipes(new ValidationPipe({
        exceptionFactory: (errors) => {
            const result: any = {}
            errors.forEach((error) => {
                result[error.property] = error.constraints[Object.keys(error.constraints)[0]];
            });
            return {
                code: 400,
                data: null,
                message: result
            }
        },
        // stopAtFirstError: true,
    }));

    //helmet protection
    app.use(helmet())

    //cors origin
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
    })
}