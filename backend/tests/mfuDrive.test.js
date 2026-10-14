'use strict';

const mfuDrive = require('../helpers/mfuDrive');

describe('MFU Drive storage helper', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        for (const key of Object.keys(process.env)) {
            if (!(key in originalEnv)) delete process.env[key];
        }
        Object.assign(process.env, originalEnv);
    });

    test('derives public WebDAV endpoint from the configured share link', () => {
        process.env.MFU_DRIVE_ENABLED = 'true';
        process.env.MFU_DRIVE_SHARE_URL = 'https://mfudrive.mfu.ac.th/s/Kmb5cGFZom7pQiC';
        delete process.env.MFU_DRIVE_WEBDAV_URL;
        delete process.env.MFU_DRIVE_PUBLIC_URL;

        expect(mfuDrive.config().webDavUrl).toBe(
            'https://mfudrive.mfu.ac.th/public.php/dav/files/Kmb5cGFZom7pQiC'
        );
        expect(mfuDrive.publicFileUrl('account/Artist/ผู้เรียน/ภาพ งาน.jpg')).toContain(
            '/account/Artist/%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99/%E0%B8%A0%E0%B8%B2%E0%B8%9E%20%E0%B8%87%E0%B8%B2%E0%B8%99.jpg'
        );
    });

    test('maps local public folder paths to safe Drive-relative paths', () => {
        expect(mfuDrive.relativePathFromPublicFolder(
            'C:\\workspace\\backend\\public\\account\\Artist',
            'image.jpg'
        )).toBe('account/Artist/image.jpg');
        expect(() => mfuDrive.normalizeRelativePath('../outside.jpg')).toThrow();
    });

    test('maps existing local and Drive URLs to relative paths', () => {
        process.env.MFU_DRIVE_ENABLED = 'true';
        process.env.MFU_DRIVE_PUBLIC_URL = 'https://mfudrive.mfu.ac.th/public.php/dav/files/share';
        expect(mfuDrive.relativePathFromStoredUrl(
            'http://127.0.0.1:8081/account/Artist/A/image.jpg'
        )).toBe('account/Artist/A/image.jpg');
        expect(mfuDrive.relativePathFromStoredUrl(
            'https://mfudrive.mfu.ac.th/public.php/dav/files/share/account/Artist/A/image.jpg'
        )).toBe('account/Artist/A/image.jpg');
    });
});
