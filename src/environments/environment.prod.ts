export const environment = {
    production: true,
    // TODO: Replace with production URLs
    apiUrls: {
        users: 'https://api.yourschool.com/users',
        tenant: 'https://api.yourschool.com/tenant',
        student: 'https://api.yourschool.com/student',
        teacher: 'https://api.yourschool.com/teacher',
        class: 'https://api.yourschool.com/class',
        assessment: 'https://api.yourschool.com/assessment',
        attendance: 'https://api.yourschool.com/attendance',
        finance: 'https://api.yourschool.com/finance',
        auditLogs: 'https://api.yourschool.com/audit-logs',
        communication: 'https://api.yourschool.com/communication',
        notification: 'https://api.yourschool.com/notification',
        document: 'https://api.yourschool.com/document',
        report: 'https://api.yourschool.com/report',
        library: 'https://api.yourschool.com/library',
        curriculum: 'https://api.yourschool.com/curriculum',
        event: 'https://api.yourschool.com/event',
        guardian: 'https://api.yourschool.com/guardian',
        scheduler: 'https://api.yourschool.com/scheduler'
    },
    
    webSocket: {
        url: 'wss://api.yourschool.com/communication/ws',
        topics: {
            messages: '/topic/messages',
            notifications: '/topic/notifications',
            presence: '/topic/presence',
            userQueue: '/user/queue'
        }
    },
    
    jwt: {
        tokenKey: 'auth_token',
        refreshTokenKey: 'refresh_token',
        expiresInMs: 24 * 60 * 60 * 1000
    },
    
    tenant: {
        headerKey: 'X-Tenant-ID',
        storageKey: 'tenant_id'
    },
    
    pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 25, 50, 100]
    },
    
    fileUpload: {
        maxSizeInMB: 10,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
    }
};
