const { PrismaClient } = require('./src/generated/client');
const p = new PrismaClient();
p.surveyResponse.findMany({where: {pageSlug: {startsWith: 'workshop-'}}})
  .then(res => { 
    console.log(JSON.stringify(res, null, 2)); 
    return p.$disconnect(); 
  });
