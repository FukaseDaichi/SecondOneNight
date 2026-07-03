import fs from 'fs';
import path from 'path';

// 今後使用するかも
const postsDirectory = path.join(process.cwd(), 'public/images/icon');

export function getSortedPostsData(): string[] {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames.map((fileName) => {
        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);

        return fullPath;
    });

    // Sort posts by date
    return allPostsData;
}
