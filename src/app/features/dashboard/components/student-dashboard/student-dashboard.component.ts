import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationConfig } from '../../../../../application-config';

@Component({
  selector: 'app-student-dashboard',
  imports: [SharedModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {

  appConfig = ApplicationConfig;
  userName = '';
  
  //Todo : Get data from API
  // Sample data 
  courses = [
    { id: 1, name: 'Mathematics', teacher: 'Dr. John Smith', progress: 75 },
    { id: 2, name: 'Science', teacher: 'Ms. Sarah Johnson', progress: 60 },
    { id: 3, name: 'English', teacher: 'Mrs. Emily Davis', progress: 90 },
    { id: 4, name: 'History', teacher: 'Mr. Michael Brown', progress: 45 }
  ];
  
  assignments = [
    { id: 1, title: 'Math Homework', course: 'Mathematics', dueDate: '2025-04-05', status: 'pending' },
    { id: 2, title: 'Science Lab Report', course: 'Science', dueDate: '2025-04-10', status: 'completed' },
    { id: 3, title: 'English Essay', course: 'English', dueDate: '2025-04-15', status: 'pending' },
    { id: 4, title: 'History Research', course: 'History', dueDate: '2025-04-08', status: 'overdue' }
  ];
  
  announcements = [
    { id: 1, title: 'School Closed for Spring Break', date: '2025-03-25', content: 'The school will be closed for spring break from April 12-19.' },
    { id: 2, title: 'Science Fair Registration Open', date: '2025-03-22', content: 'Registration for the annual science fair is now open. Sign up by April 30.' }
  ];
  
}
