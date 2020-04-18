#!/usr/bin/env node

const cm = require('commander')
const inq = require('inquirer')
const builder = require('./bin/index')

cm.version('0.0.1')
cm.command('init <name>')
	.description("init a new react app with NIL's favorite setup")
	.action( name =>{
		console.log(name)
		// inq.prompt()
		builder({ name })
	})
cm.parse(process.argv)

const inquirers = [

]
