FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /flask-server

COPY requirements.txt /flask-server/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /flask-server/

EXPOSE 8501

CMD ["flask", "run", "--host=0.0.0.0"]
