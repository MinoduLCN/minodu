FROM ghcr.io/minodulcn/minodu-python-base:latest AS base

RUN poetry config virtualenvs.create false
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --only=main --no-interaction --no-ansi

ENV APP_HOME=/app
WORKDIR $APP_HOME

# copy files
COPY ./minodu_ai_services ./

# unzip models
RUN (cd models/stt_models && unzip -o vosk-model-small-fr-0.22.zip && unzip -o vosk-model-small-en-us-0.15.zip)

# run app
CMD python main.py