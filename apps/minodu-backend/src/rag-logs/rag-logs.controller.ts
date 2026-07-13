import { Controller, Delete, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RagLogsService } from './rag-logs.service';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { userRole } from 'src/roles/entities/user_role.enum';
import { Throttle } from '@nestjs/throttler';

@ApiTags("Rag Logs")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller({
  path: 'rag-logs',
  version: "1"
})
export class RagLogsController {
  constructor(
    private readonly ragLogsService: RagLogsService
  ) { }
  
  @Roles(userRole.ADMIN)
  @ApiOperation({ summary: "Read Rag Logs", description: "Read raw Rag log files" })
  @Get()
  @ApiQuery({ 
    name: 'lines', 
    required: false, 
    type: Number,
    description: "Number of lines to retrieve (default: 500)"
  })
  async readRagLogs(
    @Query('lines') lines,
    @Res() res: Response
  ) {
    try {
      const logContent = await this.ragLogsService.readRawLogs(
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
    summary: "Download Rag logs data into text file",
    description: "Download Rag logs data from the system into text file"
  })
  @Get('download')
  async downloadLogs(@Res() res: any): Promise<object> {
      return this.ragLogsService.download(res);
  }
  
  @Roles(userRole.ADMIN)
  @ApiOperation({ summary: "Empty logs files", description: "Empty all logs files" })
  @Delete()
  emptyLogsFiles() {
    return this.ragLogsService.emptyLogFile();
  }

}
