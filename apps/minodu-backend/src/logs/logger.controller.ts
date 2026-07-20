import { Controller, Delete, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { userRole } from 'src/roles/entities/user_role.enum';
import { LoggerService } from './logger.service';
import { Throttle } from '@nestjs/throttler';


@ApiTags("Backend Logs")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller({
  path: 'backend-logs',
  version: "1"
})
export class LoggerController {
  constructor(
    private readonly loggerService: LoggerService
  ) { }
  
  @Roles(userRole.ADMIN)
  @ApiOperation({ summary: "Read Backend Logs", description: "Read raw backend log files" })
  @Get()
  @ApiQuery({ 
    name: 'lines', 
    required: false, 
    type: Number,
    description: "Number of lines to retrieve (default: 500)"
  })
  async readBackendLogs(
    @Query('lines') lines,
    @Res() res: Response
  ) {
    try {
      const logContent = await this.loggerService.readRawLogs(
        lines,
      );
      
      // Return as plain text
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(logContent);
      
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message
      });
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 tentatives par 10 minute
  @Roles(userRole.ADMIN)
  @ApiOperation({
    summary: "Download Backend logs data into text file",
    description: "Download Backend logs data from the system into text file"
  })
  @Get('download')
  async downloadLogs(@Res() res: any): Promise<object> {
      return this.loggerService.download(res);
  }
  
  @Roles(userRole.ADMIN)
  @ApiOperation({ summary: "Empty backend logs files", description: "Empty all logs files from the backend" })
  @Delete()
  emptyLogsFiles() {
    return this.loggerService.emptyLogFile();
  }

}
