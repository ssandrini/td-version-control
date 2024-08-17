#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const simpleGit = require('simple-git');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const hidefile = require('hidefile');

const initRepo = async () => {
    try {
        const tdDir = path.join(process.cwd(), '.td');
        if (!fs.existsSync(tdDir)) {
            fs.mkdirSync(tdDir);
        }
        hidefile.hideSync('.td');

        process.chdir(tdDir);
        const git = simpleGit();
        if (!fs.existsSync('.git')) {
            await git.init();
            //console.log('Initialized empty Git repository in .td');
        } else {
            console.log('Git repository already exists in .td');
        }

        process.chdir('..');
        const toeFile = findToeFile();
        if (toeFile) {
            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: 'inherit' });
                //console.log(`Expanded ${toeFile}`);
            } catch (e) {
                // no hago nada por ahora con el error
            }

            // muevo los archivos de toeexpand a .td
            const expandedFiles = fs.readdirSync('.').filter(file => file !== '.td' && path.extname(file).toLowerCase() !== ".toe" && file !== 'Backup');
            for (const file of expandedFiles) {
                const targetPath = path.join(tdDir, file);
                fs.renameSync(file, targetPath);
            }

            process.chdir(tdDir);
            await git.add('.');
            await git.commit('Initial version');
            await git.addAnnotatedTag("version0", "version0");
            process.chdir('..'); // Volver al directorio raíz
            console.log("Created initial version: version0")
        } else {
            console.log('No .toe file found');
        }

    } catch (err) {
        console.error('Error in initRepo:', err);
    }
};

const newVersion = async (name, message) => {
    try {
        expandAndMove();
        const git = simpleGit();
        await git.add('.');
        await git.commit(`-m "${message}" --allow-empty`);
        await git.addAnnotatedTag(name, message);

        console.log(`Created new version: ${name}`);
    } catch (error) {
        console.error('Error creating new version:', error);
    }
};

const checkoutVersion = async (version) => {
    try {
        const toeFile = findToeFile();
        if (!toeFile) {
            console.log('No .toe file found');
            return;
        }

        const rootDir = process.cwd();
        const tdDir = path.join(rootDir, '.td');
        process.chdir(tdDir);
        const git = simpleGit();

        const tags = await git.tags();
        if (!tags.all.includes(version)) {
            console.log(`Version ${version} not found`);
            return;
        }

        await git.checkout(version);

        try {
            execSync(`toecollapse.exe ${toeFile}`, { stdio: 'inherit' });
            console.log(`Collapsed to version ${version}`);
        } catch (e) {
            console.error('Error collapsing version:', e);
        }

        const newToeFile = findToeFile();
        if (newToeFile) {
            const sourcePath = path.join(tdDir, newToeFile);
            const targetPath = path.join(rootDir, newToeFile);
            //console.log(`Moving ${sourcePath} to ${targetPath}`);
            fs.renameSync(sourcePath, targetPath);
            //console.log(`Moved new .toe to root directory`);
        } else {
            console.log('No new .toe file found after collapse');
        }
    } catch (error) {
        console.error('Error checking out version:', error);
    }
};

const listVersions = async () => {
    try {
        const tdDir = path.join(process.cwd(), '.td');
        const git = simpleGit(tdDir);
        const tags = await git.tags();
        if (tags.all.length === 0) {
            console.log('No versions found.');
        } else {
            console.log('Available versions:');
            tags.all.forEach(tag => console.log(tag));
        }
    } catch (error) {
        console.error('Error listing versions:', error);
    }
};

const currentVersion = async () => {
    try {
        const tdDir = path.join(process.cwd(), '.td');
        const git = simpleGit(tdDir);
        const log = await git.log();
        const latestTag = await git.raw(['describe', '--tags', '--abbrev=0', log.latest.hash]);
        if (latestTag) {
            console.log(`Current version: ${latestTag.trim()}`);
        } else {
            console.log('No version found.');
        }
    } catch (error) {
        console.error('Error getting current version:', error);
    }
};

const findToeFile = () => {
    const files = fs.readdirSync('.');
    // Solo me quedo con el archivo que no tiene el numero de version
    const toeFileRegex = /^[^.]+\.toe$/;
    return files.find(file => toeFileRegex.test(file));
};

const expandAndMove = () => {
    const toeFile = findToeFile();
    if (!toeFile) {
        console.log('No .toe file found');
        return;
    }
    try {
        execSync(`toeexpand.exe ${toeFile}`, { stdio: 'inherit' });
        console.log(`Expanded ${toeFile}`);
    } catch (e) {
        // por ahora nada con el error
    }

    const tocFilePath = `${toeFile}.toc`;
    const tocContent = fs.readFileSync(tocFilePath, 'utf-8');
    const fileList = tocContent.split('\n').map(line => line.trim()).filter(line => line !== '');

    // Mover archivos a .td
    const tdDir = path.join(process.cwd(), '.td');
    if (!fs.existsSync(tdDir)) {
        fs.mkdirSync(tdDir);
    }

    for (const file of fileList) {
        const sourcePath = path.join(process.cwd(), `${toeFile}.dir`, file);
        const targetPath = path.join(tdDir, `${toeFile}.dir`, file);
        //console.log(`moving file: ${file} from ${sourcePath} to ${targetPath}`);
        fs.renameSync(sourcePath, targetPath);
    }

    const tocTargetPath = path.join(tdDir, path.basename(tocFilePath));
    fs.renameSync(tocFilePath, tocTargetPath);

    const toeDirPath = path.join(process.cwd(), `${toeFile}.dir`);
    fs.rm(toeDirPath, { recursive: true, force: true });

    process.chdir(tdDir);
}

const nodeChanges = async () => {
    try {
        const tocFile = `${findToeFile()}.toc`;
        expandAndMove();
        const git = simpleGit();
        process.chdir('..');
        const diffLines = (await git.diff([tocFile])).split('\n');
        const addedLines = diffLines.filter(line => {
            return line.startsWith('+') && !line.startsWith('+++');
        });
        const deltedLines = diffLines.filter(line => {
            return line.startsWith('-') && !line.startsWith('---');
        });
      
        const addedNodes = new Set(addedLines.map(line => {
            return extractNodeName(line);
        }));

        const deletedNodes = new Set(deltedLines.map(line => {
            return extractNodeName(line);
        }));

        for (const node of addedNodes) {
            console.log(`Added node ${node} (${await getNodeInfo(node)})`);
        }

        for (const node of deletedNodes) {
            console.log(`Deleted node ${node}`);
        }

    } catch (error) {
        console.error('Error: ', error);
    } finally {
        process.chdir('..');
    }
}

const extractNodeName = (diffLine) => {
    const lineContent = diffLine.slice(1).trim();
    const parts = lineContent.split('/');
    const fileNameWithExtension = parts[parts.length - 1];
    const fileName = fileNameWithExtension.split('.')[0];
    return fileName;
}

const getNodeInfo = async (node) => {
    try {
        const toeDirPath = path.join(process.cwd(), '.td',  `${findToeFile()}.dir`, 'project1', `${node}.n`);
        const fileContent = await fs.readFile(toeDirPath, 'utf-8');
        const firstLine = fileContent.split('\n')[0];
        return firstLine;
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

const findExpandedDir = () => {
    const dirs = fs.readdirSync('.').filter(file => fs.lstatSync(file).isDirectory());
    return dirs.length > 0 ? dirs[0] : null;
};

yargs(hideBin(process.argv))
    .command('init', 'Initialize a git repository and expand .toe file', () => {}, initRepo)
    .command('new-version', 'Create a new version', (yargs) => {
        yargs.option('name', {
            alias: 'n',
            type: 'string',
            demandOption: true,
            describe: 'Name of the new version'
        }).option('message', {
            alias: 'm',
            type: 'string',
            demandOption: true,
            describe: 'Commit message for the new version'
        });
    }, (argv) => {
        newVersion(argv.name, argv.message);
    })
    .command('checkout', 'Checkout a specific version', (yargs) => {
        yargs.option('tag', {
            alias: 't',
            type: 'string',
            demandOption: true,
            describe: 'Version to checkout'
        });
    }, (argv) => {
        checkoutVersion(argv.tag);
    })
    .command('list-versions', 'List all available versions', () => {}, listVersions)
    .command('current-version', 'Show the current version', () => {}, currentVersion)
    .command('nodes', 'List diff between versions', () => {}, nodeChanges)
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
