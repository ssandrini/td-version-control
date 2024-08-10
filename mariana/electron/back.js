import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import simpleGit from 'simple-git';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import hidefile from 'hidefile';


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
            console.log('Initialized empty Git repository in .td');
        } else {
            console.log('Git repository already exists in .td');
        }


        process.chdir('..');
        const toeFile = findToeFile();
        if (toeFile) {
            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: 'inherit' });
                console.log(`Expanded ${toeFile}`);
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
            await git.commit('Initial commit');
            await git.addAnnotatedTag("version0", "version0");
            process.chdir('..'); // Volver al directorio raíz
        } else {
            console.log('No .toe file found');
        }

    } catch (err) {
        console.error('Error in initRepo:', err);
    }
};


const newVersion = async (name, message) => {
    try {
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
            const sourcePath = path.join(process.cwd(),`${toeFile}.dir`, file);
            const targetPath = path.join(tdDir,`${toeFile}.dir`, file);
            console.log("moving file: "+ file + " of path " + sourcePath + " to " + targetPath)
            fs.renameSync(sourcePath, targetPath);
        }

        const tocTargetPath = path.join(tdDir, path.basename(tocFilePath));
        fs.renameSync(tocFilePath, tocTargetPath);

        const toeDirPath = path.join(process.cwd(), `${toeFile}.dir`);
        fs.rm(toeDirPath, { recursive: true, force: true })

        process.chdir(tdDir);
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

        const rootDir = process.cwd()
        const tdDir = path.join(process.cwd(), '.td');
        process.chdir(tdDir);
        const git = simpleGit();

        const tags = await git.tags();
        if (!tags.all.includes(version)) {
            console.log(`Version ${version} not found`);
            return;
        }

        await git.checkout(version);

        try {
            console.log("toeFile")
            execSync(`toecollapse.exe ${toeFile}`, { stdio: 'inherit' });
            console.log(`Collapsed to version ${version}`);
        } catch (e) {
            console.error('Error collapsing version:', e);
        }

        const newToeFile = findToeFile();
        if (newToeFile) {
            // Mover el archivo .toe al directorio raíz
            const sourcePath = path.join(tdDir, newToeFile);
            const targetPath = path.join(rootDir, newToeFile);
            console.log("moving " + sourcePath + " to " + targetPath)
            try {
                fs.renameSync(sourcePath, targetPath);
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log('No new .toe file found after collapse');
        }
    } catch (error) {
        console.error('Error checking out version:', error);
    }
};


const findToeFile = () => {
    const files = fs.readdirSync('.');
    return files.find(file => file.endsWith('.toe'));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
