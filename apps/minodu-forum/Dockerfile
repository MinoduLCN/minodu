FROM ghcr.io/minodulcn/minodu-python-base:latest AS base

RUN poetry config virtualenvs.create false
COPY pyproject.toml poetry.lock ./

# install python packages
RUN poetry install --no-root --only=main --no-interaction --no-ansi

ENV APP_HOME=/app
WORKDIR $APP_HOME

# copy files
COPY ./minodu_forum ./

# run app
CMD python main.py