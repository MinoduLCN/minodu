import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RAG_LOG } from './constants';
import { promises as fs } from 'fs';
import { LoggerService } from 'src/logs/logger.service';
import { Response } from 'express';

@Injectable()
export class RagLogsService {

  constructor(
    private readonly loggerService: LoggerService
  ) { }

  async readRawLogs(
    lines: number
  ): Promise<string> {

    if(!lines || isNaN(lines) || lines <= 0) {
      lines = 500; // Default to 500 lines
    }

    try {
      // Check if file exists
      await fs.access(RAG_LOG.DEFAULT);
      
      const fileContent = await fs.readFile(RAG_LOG.DEFAULT, 'utf8');
      
      const allLines = fileContent.split('\n').filter(line => line.trim() !== '');
      
      // Apply offset and limit
      const endIndex = Math.min(allLines.length, lines);
      const selectedLines = allLines.slice(0, endIndex);
      
      // Return raw text
      return selectedLines.join('\n');

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new HttpException(
          `Fichier de log non trouvé: ${RAG_LOG.DEFAULT}`,
          HttpStatus.NOT_FOUND
        );
      }
      
      throw new HttpException(
        `Erreur lors de la lecture du fichier de log : ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async download(res: Response) {
    try{
      // Check if file exists
      await fs.access(RAG_LOG.DEFAULT);
      
      const fileContent = await fs.readFile(RAG_LOG.DEFAULT, 'utf8');

      this.loggerService.log(`Rag logs downloaded`, RagLogsService.name);

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="rag_logs.txt"');
      return res.send(fileContent);

    }catch (error) {
      this.loggerService.error(`Error occurred while downloading rag logs: ${error.message}`, RagLogsService.name);
      throw error;
    }
  }

  async emptyLogFile(): Promise<{ success: boolean; message: string }> {

    try {
        // Check if file exists
        await fs.access(RAG_LOG.DEFAULT);
        // Empty the file
        await fs.writeFile(RAG_LOG.DEFAULT, '', 'utf8');
      
      return {
        success: true,
        message: `Logs nettoyés avec succès.`
      };

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new HttpException(
          `Un ou plusieurs fichiers de log sont introuvables.`,
          HttpStatus.NOT_FOUND
        );
      }
      
      throw new HttpException(
        `Erreur lors du nettoyage des logs : ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
