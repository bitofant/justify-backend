FROM node:alpine

ARG HTTP_PORT=8081
ENV PORT=${HTTP_PORT}
ENV HOSTNAME=localhost
ENV NODE_ENV=production

WORKDIR /usr/app/
COPY ["package.json", "/usr/app/"]
COPY ["package-lock.json", "/usr/app/"]
COPY ["firestore-credentials.json", "/usr/app/"]
RUN npm i
COPY ["dist/", "/usr/app/dist/"]
HEALTHCHECK --interval=5s --timeout=4s --start-period=3s --retries=3 CMD wget localhost:${PORT}/health -q -O - > /dev/null 2>&1
# HEALTHCHECK --interval=5s --timeout=4s --start-period=3s CMD curl --fail http://localhost:${PORT}/health || exit 1
CMD ["npm", "start"]
