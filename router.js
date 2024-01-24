const express = require('express');
const router = express.Router();
const { crawler, crawlerDetail } = require('./fin.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/data', async (req, res) => {
    try {
        const { result1, categoey } = await crawler();
        const result = await crawlerDetail()
        if(!result){
            return res.status(400).json({ message: 'error' })
        }
        console.log(result, categoey)
        for(let i = 0 ; i < result1.length; i++ ) {
            const newData = result1[1]
            const checknews = await prisma.News.findFirst({ where: {  } })
        }


        res.json({ message: true, data })
    } catch (error) {
        console.error(error)
    }
});

router.get('/detail', async (req, res) => {
    try {
        const data = await crawlerDetail()

        res.json({ message: true, data })
    } catch (error) {
        console.error(error)
    }
});


module.exports = router;
