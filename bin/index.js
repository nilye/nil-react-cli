const fs = require('fs')
const execa = require('execa')
const ora = require('ora')
const chalk = require('chalk')
const ejs = require('ejs')
const rimraf = require('rimraf')
const path = require('path')

const templatePath = path.resolve(__dirname, '../template'),
	pkgList = {
		dep: [
			"react",
			"react-dom"
		],
		dev: [
			"@babel/core",
			"@babel/preset-env",
			"@babel/preset-react",
			"babel-loader",
			"clean-webpack-plugin",
			"copy-webpack-plugin",
			"css-loader",
			"dotenv",
			"html-webpack-plugin",
			"mini-css-extract-plugin",
			"optimize-css-assets-webpack-plugin",
			"terser-webpack-plugin",
			"webpack",
			"webpack-cli",
			"webpack-dev-server"
		]
	}

let print = ora()

async function main({ name }){

	print.start('writing project files')

	const targetPath = `${process.cwd()}/${name}`
	// read template file list
	const	template = readFiles(templatePath)

	// create folder and write files
	try {
		await createProjDir(targetPath)
		for (let f of template){
			let path = targetPath + '/' + f[1]
			if (f[0] === 'file'){
				await writeFile(f[1], path, { name })
			} else {
				fs.mkdirSync(path)
			}
		}
	} catch (err) {
		console.log(err)
		print.fail(err)
	}

	// install node modules
	print.start('installing packages at: ' + targetPath)
	await (async ()=>{
		try {
			const dep = await execa.command('yarn add ' + pkgList.dep.join(' '), {
				cwd: targetPath
			})

			const dev = await execa.command('yarn add --dev ' + pkgList.dev.join(' '), {
				cwd: targetPath
			})
		} catch (err) {
			console.log(err)
			print.fail(err)
		}
	})()

	print.succeed('project created')
	print.stop()
}


function createProjDir(targetPath){
	return new Promise((resolve, reject) => {
		rimraf(targetPath, {}, ()=>{
			fs.mkdir(targetPath, err =>{
				if (err) reject(err)
				resolve()
			})
		})
	})
}

function readFiles(fromPath, parentDir = ''){
	const files = fs.readdirSync(fromPath)
	let output = []
	files.forEach(item => {
		const path = fromPath + '/' + item,
			stats = fs.statSync(path)
		if (stats.isDirectory()){
			output.push(['dir', parentDir+item])
			output = output.concat(readFiles(path, item+'/'))
		} else {
			output.push(['file', parentDir+item])
		}
	})
	return output
}

function writeFile(fileName, targetPath, dynamicData){
	return new Promise((resolve, reject)=>{
		fs.readFile(templatePath + '/' + fileName, 'utf-8', (err, data)=>{
			if (err) reject(err)
			let fileData = ejs.render(data || '', dynamicData) || ''
			fs.writeFile(targetPath, fileData, 'utf8', (err)=>{
				if (err) reject(err)
				print.succeed(fileName)
				resolve()
			})
		})
	})
}


module.exports = main
