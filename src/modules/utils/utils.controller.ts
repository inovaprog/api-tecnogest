import { Controller, Get, Logger } from '@nestjs/common';
import {  ApiTags } from '@nestjs/swagger';


@ApiTags('Utils')
@Controller()
export class UtilsController {
    private readonly logger = new Logger(UtilsController.name);

    @Get('version')
    getAPIVersion(): any {
        return {
            gitHash: process.env.hash_git,
            apiVersion: process.env.api_version,
        };
    }
}
