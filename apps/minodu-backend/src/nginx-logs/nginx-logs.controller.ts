import { Controller, Delete, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NginxLogsService } from './nginx-logs.service';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { userRole } from 'src/roles/entities/user_role.enum';
import { Throttle } from '@nestjs/throttler';


@ApiTags("Nginx Logs")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller({
  path: 'nginx-logs',
  version: "1"
})
export class NginxLogsController {
  constructor(
    private readonly nginxLogsService: NginxLogsService
  ) { }
  
  @Roles(userRole.ADMIN)
  @ApiOperation({ summary: "Read Nginx Logs", description: "Read raw Nginx log files" })
  @Get()
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ['access', 'error', 'default'],
    description: "Type of log to read: 'access' , 'error' or 'default'"
  })
  @ApiQuery({ 
    name: 'lines', 
    required: false, 
    type: Number,
    description: "Number of lines to retrieve (default: 500)"
  })
  async readNginxLogs(
    @Query('type') type,
    @Query('lines') lines,
    @Res() res: Response
  ) {
    try {
      const logContent = await this.nginxLogsService.readRawLogs(
        type,
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
    summary: "Download Frontend logs data into text file",
    description: "Download Frontend logs data from the system into text file"
  })
  @Get('download')
  async downloadLogs(@Res() res: any): Promise<object> {
      return this.nginxLogsService.download(res);
  }
  
  @Roles(userRole.ADMIN)
  @ApiOperation({ summary: "Empty logs files", description: "Empty all logs files" })
  @Delete()
  emptyLogsFiles() {
    return this.nginxLogsService.emptyLogFile();
  }

}
