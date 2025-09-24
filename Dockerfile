FROM node:20-alpine
 
WORKDIR /app
 
ENV NODE_ENV=development
 
COPY package.json yarn.lock ./
RUN yarn install
 
COPY . .
 
EXPOSE 3000
 
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
 
CMD ["yarn", "dev"]
