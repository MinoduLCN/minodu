import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { promises as fs } from 'fs';
import * as path from 'path';
import { LOG_DIR } from './constants';
import { Response } from 'express';


@Injectable()
export class LoggerService {

  private logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: `${LOG_DIR.DEFAULT}/combined.log`,
        maxsize:5120
    }),

    ],
  });

  log(message: string, context?: string) {
    this.logger.log('info', message, { context });
  }

  error(message: string, context?: string) {
    this.logger.log('error', message, { context });
  }

  async readRawLogs(lines: number): Promise<string> {
    try {
      if(!lines || isNaN(lines) || lines <= 0) {
        lines = 500; // Default to 500 lines
      }

      const allFiles = await fs.readdir(LOG_DIR.DEFAULT);

      const logFiles = allFiles.filter(file => 
        file.endsWith('.log')
      );

      const contents = await Promise.all(
        logFiles.map(file => fs.readFile(path.join(LOG_DIR.DEFAULT, file), 'utf8'))
      );
      
      // Apply offset and limit
      const endIndex = Math.min(contents.length, lines);
      const selectedLines = contents.slice(0, endIndex);
      
      // Return raw text
      return selectedLines.join('\n');

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Le dossier ${LOG_DIR.DEFAULT} n'existe pas.`);
      }
      throw new Error(`Erreur lors de la lecture : ${error.message}`);
    }
  } 

  async download(res: Response) {
    try{
      const allFiles = await fs.readdir(LOG_DIR.DEFAULT);

      const logFiles = allFiles.filter(file => 
        file.endsWith('.log')
      );

      const fileContent = await Promise.all(
        logFiles.map(file => fs.readFile(path.join(LOG_DIR.DEFAULT, file), 'utf8'))
      );
      const combinedContent = fileContent.join('\n');
      this.log(`Backend logs downloaded`, LoggerService.name);

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="backend_logs.txt"');
      return res.send(combinedContent);

    }catch (error) {
      this.error(`Error occurred while downloading backend logs: ${error.message}`, LoggerService.name);
      throw error;
    }
  }

  async emptyLogFile(): Promise<{ success: boolean; message: string }> {
     try {
      const allFiles = await fs.readdir(LOG_DIR.DEFAULT);

      const logFiles = allFiles
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(LOG_DIR.DEFAULT, file),
      }));

      if (logFiles.length === 0) {
        return { success: true, message: "Aucun fichier log à traiter." };
      }

      logFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      
      const lastFile = logFiles.pop(); // Retire et récupère le dernier élément
      const filesToDelete = logFiles;

      // Supprimer les anciens fichiers
      await Promise.all(filesToDelete.map(file => fs.unlink(file.path)));

      // Vider le dernier fichier
      if (lastFile) {
        await fs.writeFile(lastFile.path, '', 'utf8');
      } 

      } catch (error) {
        throw new HttpException(
          `Erreur lors du nettoyage des logs : ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

    return {
        success: true,
        message: `Logs nettoyés avec succès.`
      };
  }

}