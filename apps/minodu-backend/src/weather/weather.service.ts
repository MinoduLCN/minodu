import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Weather } from './entities/weather.entity';
import { SyncWeatherDto } from './dto/sync-weather.dto';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import axios from 'axios';
import { LoggerService } from 'src/logs/logger.service';
import { DataFormater } from 'src/utils/data.formatter';

@Injectable()
export class WeatherService {

  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    private readonly loggerService: LoggerService
  ) { }

  async sync(syncWeatherDto: SyncWeatherDto) {
    if (!syncWeatherDto) return;

    try {
      var weather = this.weatherRepository.create({
          temperature: syncWeatherDto.temp,
          temperature1: syncWeatherDto.temp1,
          humidity: syncWeatherDto.hum,
          humidity1: syncWeatherDto.hum1,
          pressure: syncWeatherDto.press,
          luminosity: syncWeatherDto.lux,
          ambient: syncWeatherDto.ambient,
          co: syncWeatherDto.CO,
          no2: syncWeatherDto.NO2,
          wind_direction: syncWeatherDto.wind_dir,
          wind_speed: syncWeatherDto.wind_spd,
          indice_uv: syncWeatherDto.uv,
          battery: syncWeatherDto.battery
        });


      const latestInterpretedData = await this.findLatestWeatherInterpretation();
      const thresholdMinutes = 1; // 30 minutes threshold to trigger new interpretation
      var diffMinutes = thresholdMinutes;

      if (latestInterpretedData) {
        const now = new Date();
        const lastInterpretationDate = new Date(latestInterpretedData.date);
        const diffMs = now.getTime() - lastInterpretationDate.getTime();
        diffMinutes = diffMs / (1000 * 60);
      }

      const shouldInterpret = (diffMinutes > thresholdMinutes) || (latestInterpretedData === null);

      if (!shouldInterpret && latestInterpretedData) {
        weather.description = latestInterpretedData.description;
      }

      weather = await weather.save();
      this.loggerService.log(`Weather data synchronized (ID: ${weather.id})`);

      if (shouldInterpret) {
        const weatherAiData = {
          temperature: weather.temperature,
          humidity: weather.humidity,
          pressure: weather.pressure,
          luminosity: weather.luminosity,
          ambient_luminosity: weather.ambient,
          carbon_monoxide: weather.co,
          nitrogen_dioxide: weather.no2,
          wind_spd: weather.wind_speed,
          wind_dir: weather.wind_direction
        };

        const weatherId = weather.id;
        this.interpretWeather(weatherAiData)
          .then(async description => {
            if (!description) return;
            await this.weatherRepository.update(weatherId, { description });
            this.loggerService.log(`Weather data interpreted (ID: ${weatherId})`);
          })
          .catch(err => {
            this.loggerService.error(
              `Weather interpretation failed (ID: ${weatherId}): ${err.message}`,
              WeatherService.name,
            );
          });
      }

      return weather;

    } catch (error) {
      this.loggerService.error(`Sync failed: ${error.message}`, WeatherService.name);
      throw error;
    }
  }


  async interpretWeather(data): Promise<string | null> {
    try {
      const response = await axios.post(
        `${process.env.AI_SERVICE_URL}/weather/text`,
        { language: 'fr', sensor_data: data },
        { responseType: 'text', transformResponse: [(d) => d] },
      );
      const text = typeof response.data === 'string' ? response.data.trim() : '';
      if (!text) return null;
      if (text.includes('[ERROR:')) {
        this.loggerService.error(`AI service returned error payload: ${text}`, WeatherService.name);
        return null;
      }
      return text;
    } catch (error) {
      this.loggerService.error(`Error occurred while interpreting weather data: ${error.message}`, WeatherService.name);
      throw error;
    }
  }

  async download(res: Response) {
     const workbook = new  Workbook();
     const worksheet = workbook.addWorksheet('Les données méteo');

    try{
      // Define columns in the Excel file
      const columns = [
        { header: 'ID', key: 'id', width: 5 },
        { header: 'temp', key: 'temp', width: 15 },
        { header: 'temp1', key: 'temp1', width: 15 },
        { header: 'hum', key: 'hum', width: 15 },
        { header: 'hum1', key: 'hum1', width: 15 },
        { header: 'press', key: 'press', width: 15 },
        { header: 'lux', key: 'lux', width: 15 },
        { header: 'ambient', key: 'ambient', width: 15 },
        { header: 'CO', key: 'CO', width: 15 },
        { header: 'NO2', key: 'NO2', width: 15 },
        { header: 'wind_dir', key: 'wind_dir', width: 15 },
        { header: 'wind_spd', key: 'wind_spd', width: 15 },
        { header: 'uv', key: 'uv', width: 15 },
        { header: 'battery', key: 'battery', width: 15 },
        { header: 'time', key: 'time', width: 20 }
      ];

      // Appliquer les colonnes à la feuille Excel
      worksheet.columns = columns;

      const data = await this.findAll();

      // Ajouter les lignes de données
      var i = 0;

      const rows = await Promise.all(data.map(async (weather) => {
  
          // row data
          const row: any = {
            id: i+1,
            temp: weather.temperature,
            temp1: weather.temperature1,
            hum: weather.humidity,
            hum1: weather.humidity1,
            press: weather.pressure,
            lux: weather.luminosity,
            ambient: weather.ambient,
            CO: weather.co,
            NO2: weather.no2,
            wind_dir: weather.wind_direction,
            wind_spd: weather.wind_speed,
            uv: weather.indice_uv,
            battery: weather.battery,
            time: weather.createdAt,
          };
          i++;
          return row;
        }
      ));

      // Ajouter toutes les lignes à la feuille Excel
      worksheet.addRows(rows.filter(row => row !== null));

      // Generer le fichier Excel en memoire
      const buffer = await workbook.xlsx.writeBuffer();

      this.loggerService.log(`Weather data downloaded (${rows.length} records)`, WeatherService.name);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="weather_data.xlsx"`);
      return res.send(buffer);

    }catch (error) {
      this.loggerService.error(`Error occurred while downloading weather data: ${error.message}`, WeatherService.name);
      throw error;
    }
  }

  findAll(limit?:number) {
    try {
      return this.weatherRepository.find({ take: limit });
    } catch (error) {
      this.loggerService.error(`Error occurred while fetching weather data: ${error.message}`, WeatherService.name);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const one = await this.weatherRepository.findOne({ where: { id } });
      if (!one) {
        throw new NotFoundException('Donnée météo non trouvée !');
      }
      return one;
    } catch (error) {
      this.loggerService.error(`Error occurred while fetching weather data: ${error.message}`, WeatherService.name);
      throw error;
    }
  }

  async findCurrent() {
    try {
      const latest = await this.weatherRepository.findOne({
        where:{},
        order:{
          createdAt:'DESC'
        }
      });
  
      if (!latest) {
        this.loggerService.error('No weather data found', WeatherService.name);
        throw new NotFoundException('Aucune donnée météo trouvée !');
      }
      return latest;
    } catch (error) {
      this.loggerService.error(`Error occurred while fetching current weather data: ${error.message}`, WeatherService.name);
      throw error;
    }
  }

  async findLatestWeatherInterpretation() {
    try {
      const latest = await this.weatherRepository.findOne({
        where:{description: Not(IsNull())},
        order:{
          createdAt:'DESC'
        }
      });
      return (latest) ? {description: latest.description, date: latest.createdAt} : null;
    } catch (error) {
      this.loggerService.error(`Error occurred while fetching current weather data: ${error.message}`, WeatherService.name);
      return null;
    }
  }

  async removeAll() {
    try {
      await this.weatherRepository.clear();
      this.loggerService.log('All weather records have been deleted successfully', WeatherService.name);
      return { message: 'All records have been deleted successfully.' };
    } catch (error) {
      this.loggerService.error(`Error occurred while removing all weather data: ${error.message}`, WeatherService.name);
      throw error;
    }
  }

}
