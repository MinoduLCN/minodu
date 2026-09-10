from datetime import datetime
import os
import sys
import logging
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from typing import Iterator, Optional
import textwrap
from dataclasses import dataclass, asdict
import langchain

from ..vars import LanguageEnum

# At the top of your file or in __init__

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class WeatherLLM:

    @dataclass
    class SensorData:
        temperature: Optional[float] = None
        humidity: Optional[float] = None
        pressure: Optional[float] = None
        carbon_monoxide: Optional[float] = None
        nitrogen_dioxide: Optional[float] = None
        wind_dir: Optional[float] = None
        wind_spd: Optional[float] = None
        luminosity: Optional[float] = None
        ambient_luminosity: Optional[float] = None

    def __init__(self, language : LanguageEnum):

        langchain.debug = True

        ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434/")
        ollama_model = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

        self.llm = OllamaLLM(base_url=ollama_host, model=ollama_model, temperature=0.1, keep_alive=600 )

        # Determine the season based on the current month (Kara, Togo)
        current_month = datetime.now().month
        season = {}

        def get_season():
        # Logic to determine the season
            if 4 <= current_month <= 10:
                # Rainy Season (April to October)
                match language:
                    case LanguageEnum.fr:
                        return "saison des pluies"
                    case LanguageEnum.en:
                        return "rainy season"
            else:
                # Dry Season (November to March)
                match language:
                    case LanguageEnum.fr:
                        return  "saison sèche" 
                    case LanguageEnum.en:
                        return "dry season"
        
        # Simple chaine
        if language == LanguageEnum.en:
            self.template = textwrap.dedent("""
                You are a meteorological expert advising farmers in Kara, northern Togo.
                Analyze the data below, taking the current season ({season}) into account.

                **Station Data:**
                - Temperature: {temperature}°C
                - Relative Humidity: {humidity}%
                - Atmospheric Pressure: {pressure} hPa
                - Luminosity: {luminosity} lux
                - Carbon Monoxide (CO): {carbon_monoxide}
                - Nitrogen Dioxide (NO2): {nitrogen_dioxide}
                - Wind Direction: {wind_dir}
                - Wind Speed: {wind_spd}

                **Response Instructions:**
                - Use very simple language, dont use any expert terms.
                - Describe current conditions, rain risks, air quality (if relevant), and impact on crops.
                - Do not quote any raw numbers from the data.
                - Tailor your analysis to the current season ({season}).
                - Limit your response to 150 words maximum in a single paragraph.
                                            
                Write your response now.
                """)
        elif language == LanguageEnum.fr:
            self.template = textwrap.dedent("""
                Vous êtes un expert en météorologie chargé de conseiller les agriculteurs de Kara, dans le nord du Togo.
                Analysez les données ci-dessous en tenant compte de la saison en cours ({season}).

                **Données de la station :**
                - Température : {temperature} °C
                - Humidité relative : {humidity} %
                - Pression atmosphérique : {pressure} hPa
                - Luminosité : {luminosity} lux
                - Monoxyde de carbone (CO) : {carbon_monoxide}
                - Dioxyde d'azote (NO₂) : {nitrogen_dioxide}
                - Direction du vent : {wind_dir}
                - Vitesse du vent : {wind_spd}

                **Instructions pour la réponse :**
                - Utilisez un langage très simple, n'utilisez aucun terme technique.
                - Décrivez les conditions actuelles, les risques de pluie, la qualité de l'air (le cas échéant) et l'impact sur les cultures.
                - Ne citez aucun chiffre brut tiré des données.
                - Adaptez votre analyse à la saison en cours ({season}).
                - Limitez votre réponse à 150 mots maximum en un seul paragraphe.
                                            
                Rédigez votre réponse maintenant.        
            """)
        
        self.prompt = ChatPromptTemplate.from_template(self.template)
        
        # Create the chain
        self.chain = (
            RunnablePassthrough().assign(
                season = lambda _: get_season()
            )
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
    
    def ask(self, sensorData : SensorData) -> str:
        return self.chain.invoke(asdict(sensorData))
    
    def ask_streaming(self, sensorData : SensorData) -> Iterator[str]:
        for chunk in self.chain.stream(asdict(sensorData)):
            yield chunk

