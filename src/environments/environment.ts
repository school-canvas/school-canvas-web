export const environment = {
    production: false,
    // API URLs for all microservices
    apiUrls: {
        users: 'http://localhost:8080',         // Auth, Users, Roles
        tenant: 'http://localhost:8081',        // Tenant Management
        student: 'http://localhost:8082',       // Student Management
        teacher: 'http://localhost:8083',       // Teacher Management
        class: 'http://localhost:8084',         // Class & Enrollment
        assessment: 'http://localhost:8085',    // Assessments, Submissions
        attendance: 'http://localhost:8086',    // Student & Teacher Attendance
        finance: 'http://localhost:8087',       // Fee, Payment, Invoice
        auditLogs: 'http://localhost:8088',     // Audit Logs
        communication: 'http://localhost:8094', // Messages, Announcements, WebSocket
        notification: 'http://localhost:8093',  // Notifications
        document: 'http://localhost:8095',      // Document Upload/Download
        report: 'http://localhost:8096',        // Report Generation
        library: 'http://localhost:8097',       // Library Management
        curriculum: 'http://localhost:8091',    // Curriculum, Subjects, Topics
        event: 'http://localhost:8092',         // Events & Calendar
        guardian: 'http://localhost:8089',      // Guardian/Parent Management
        scheduler: 'http://localhost:8090'      // Class Schedule, Time Slots
    },
    
    // WebSocket Configuration (Communication Service)
    webSocket: {
        url: 'http://localhost:8094/ws',
        topics: {
            messages: '/topic/messages',
            notifications: '/topic/notifications',
            presence: '/topic/presence',
            userQueue: '/user/queue'
        }
    },
    
    // JWT Configuration
    jwt: {
        tokenKey: 'auth_token',
        refreshTokenKey: 'refresh_token',
        expiresInMs: 24 * 60 * 60 * 1000  // 24 hours
    },
    
    // Tenant Configuration
    tenant: {
        headerKey: 'X-Tenant-ID',
        storageKey: 'tenant_id'
    },
    
    // Pagination defaults
    pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 25, 50, 100]
    },
    
    // File upload limits
    fileUpload: {
        maxSizeInMB: 10,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
    }
}