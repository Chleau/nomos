FROM node:20-alpine
 
WORKDIR /app
 
ENV NODE_ENV=development
 
COPY package.json yarn.lock ./
RUN yarn install
<<<<<<< HEAD

COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

=======
 
COPY . .
 
EXPOSE 3000
 
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
 
>>>>>>> origin/theo
CMD ["yarn", "dev"]