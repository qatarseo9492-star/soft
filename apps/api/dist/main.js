"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? '*',
        credentials: false,
    });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    const port = process.env.PORT ? Number(process.env.PORT) : 3011;
    await app.listen(port);
    console.log(`API listening on :${port}`);
}
bootstrap();
