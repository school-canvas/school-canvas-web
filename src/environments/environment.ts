export const environment = {
    production: false,
    // API URLs for all microservices
    apiUrls: {
        users: 'http://localhost:8080/api/v1',         // Auth, Users, Roles
        tenant: 'http://localhost:8081/api/v1',        // Tenant Management
        student: 'http://localhost:8082/api/v1',       // Student Management
        teacher: 'http://localhost:8084/api/v1',       // Teacher Management
        class: 'http://localhost:8083/api/v1',         // Class & Enrollment
        assessment: 'http://localhost:8085/api/v1',    // Assessments, Submissions
        attendance: 'http://localhost:8086/api/v1',    // Student & Teacher Attendance
        finance: 'http://localhost:8087/api/v1',       // Fee, Payment, Invoice
        auditLogs: 'http://localhost:8088/api/v1',     // Audit Logs
        communication: 'http://localhost:8094/api/v1', // Messages, Announcements, WebSocket
        notification: 'http://localhost:8093/api/v1',  // Notifications
        document: 'http://localhost:8095/api/v1',      // Document Upload/Download
        report: 'http://localhost:8096/api/v1',        // Report Generation
        library: 'http://localhost:8097/api/v1',       // Library Management
        curriculum: 'http://localhost:8091/api/v1',    // Curriculum, Subjects, Topics
        event: 'http://localhost:8092/api/v1',         // Events & Calendar
        guardian: 'http://localhost:8089/api/v1',      // Guardian/Parent Management
        scheduler: 'http://localhost:8090/api/v1'      // Class Schedule, Time Slots
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