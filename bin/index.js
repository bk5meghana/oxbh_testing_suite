#!/usr/bin/env node

const { program } = require("commander");
const { connectToZooKeeper, isConnected, client } = require("./zookeper");
const { ensureZNodeExists, readZNodeData } = require("./zookeper/utils");
const axios = require("axios");
const jsonData = require("./json/lambdaFunctions.json");

// import {
//     program
// // } from "commander";
// import  ensureZNodeExists from "./zookeper/utils.js"

function IntialiseCLI() {
    console.log("Inside IntialiseCLI===>");
    program
        .version("1.0.0")
        .command("testdate")
        .description("Setup the Znode with test date")
        .option("-n, --testdate <type>", "Enter Testdate")
        .action(async (options) => {
            console.log(`Input recieved, ${options.testdate}!`);
            const dateValidate = validateDateTime(options.testdate);
            if (!isConnected()) {
              //  console.log("Zookeeper is offline");
                await connectToZooKeeper();
            }
            if (dateValidate) {
                //console.log("jsonData===>",jsonData,"Stringified===>",JSON.stringify(jsonData));
                const LambdaFunctions = "/LambdaFunctions";
                await ensureZNodeExists(
                    LambdaFunctions,
                    JSON.stringify(jsonData.LambdaFunctions)
                );
                const testDate = "/TestDate";
                await ensureZNodeExists(testDate, options.testdate);
                console.log("Znode created Successfully");
            } else {
                console.log("Please enter valid date");
                return false;
            }
        });

    program
        .command("triggerlambda")
        .description(
            "Trigger the required lambda functions the Znode with test date"
        )
        .option("-t, --triggerlambda <type>", "Enter lambda functions")
        .action(async (options) => {
            console.log(`Lambda Trigger , ${options.triggerlambda}!`);
            if (!isConnected()) {
              //  console.log("Zookeeper is offline");
                await connectToZooKeeper();
            }
            var lambdafunc = "/LambdaFunctions";
            const lamFunctions = await readZNodeData(lambdafunc);
           // console.log("lamFunctions==============>", lamFunctions);
            const parsedfunctions = JSON.parse(lamFunctions)
            if (options.triggerlambda.toLowerCase() == "all") {
              //  console.log('inside all loop==============>');

                parsedfunctions.forEach((func) => {
                    console.log("func==============>", func);
                    axios
                        .post(func.url)
                        .then((response) => {
                           
                            if (response.status == 200) {
                                console.log(
                                    "Lambda function invoked successfully inside if :",
                                    response.data
                                );
                            } else {
                                console.log("Lambda function invoke failed please check logs.");
                            }
                        })
                        .catch((error) => {
                            console.error("Error invoking Lambda function:", error);
                        });
                });
            } else {
                // if input lambdaname is a string or comma separated string
                const resultArray = options.triggerlambda.split(",");
                resultArray.forEach((func) => {
                   // console.log("func==============>", func);
                    const url = parsedfunctions.filter(x => x.touchpoint == func);
                    //console.log('url==============>', url);
                    if (url.length > 0) {
                        axios
                            .post(url[0].url)
                            .then((response) => {
                                
                                if (response.status == 200) {
                                    console.log(
                                        "Lambda function invoked successfully inside if :",
                                        response.data
                                    );
                                } else {
                                    console.log("Lambda function invoke failed please check logs.");
                                }
                            })
                            .catch((error) => {
                                console.error("Error invoking Lambda function:", error);
                            });
                    }

                });
            }
        });



    program.on('--help', async () => {
        try {
         
            console.log("===============List of Lambda functions=============>");
            jsonData.LambdaFunctions.forEach((element) => {
                console.log(element.touchpoint,":",element.description);
            });
            console.log("===================End==============================>");
        } catch (error) {
          console.error('Error:', error);
        }
      });
    program.parse(process.argv);
}

function validateDateTime(inputDate) {
    // Parse the input date
    const parsedDate = new Date(inputDate);

    // Check if the parsed date is a valid date
    if (isNaN(parsedDate.getTime())) {
        return false; // Invalid date format
    } else {
        return true;
    }
}

IntialiseCLI();
