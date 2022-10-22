import { TodoistApi } from "@doist/todoist-api-typescript";
import puppeteer from "puppeteer";
import * as dotenv from "dotenv";
dotenv.config();

const api = new TodoistApi(process.env.TOKEN_API);

(async () => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    await page.goto("https://randomtodolistgenerator.herokuapp.com/library");
    await page.waitForSelector(".taskCard");
    await page.evaluate(() => {
    const elements = [...document.querySelectorAll("li")];
    const targetElement = elements.find(
        (e) => e.innerText == `${Math.floor(Math.random() * 10) + 1}`
    );
    if (targetElement) targetElement.click();
    });

    const scrapedTasks = await page.evaluate(() => {
    const elements = document.querySelectorAll(".card-body");

    const tasks = [];
    for (let element of elements) {
        const task = {
            name: element.querySelector(".flexbox div").innerText,
            text: element.querySelector(".card-text").innerText,
        };
        task.name = task.name.slice(0, task.name.indexOf("\n"));
        tasks.push(task);
        }
        return tasks;
    });


    api.addSection({ name: "My new section ", projectId:"2301009288" })
    .then((section) =>{
            const sectId =  section.id
            for (let i = 0; i < 5; i++) {
                api
                    .addTask({
                        isCompleted: false,
                        content: scrapedTasks[i].name,
                        description: scrapedTasks[i].text,
                        projectId: "2301009288",
                        sectionId: sectId,
                    })
                    .then((task) => console.log(task))
                    .catch((error) => console.log(error));
            }
            console.log(section.id)
    })
    .catch((error) => console.log(error))

    await browser.close(console.log("Scraping finished"));
})();
