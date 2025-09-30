import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { AccountService } from '../account.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

  constructor( private router: Router, private accountService: AccountService) {}

   isSidebarCollapsed: boolean = false; // Track sidebar state

  isMobile: boolean = false; // Track whether the screen is mobile-sized


  // Method to toggle the sidebar
  toggleSidebarr() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Check if the screen width is below 768px for mobile devices
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true; // Collapse sidebar on small screens
    } else {
      this.isSidebarCollapsed = false; // Keep sidebar open on larger screens
    }
  }
  isCollapsed: boolean = false;
  // activeDropdown: string = '';
  loggedInUser: string = '';  // To store the username of the logged-in user

  activeSection: string = 'statistics'; // Default section is 'statistics'
  activeDropdown: string | null = null;

pendingSection: string | null = null;
@Output() backToParent = new EventEmitter<void>();

showSection(section: string) {
  // Sections that require year selection
  const captureSections = ['StrategicRisk', 'OperationalRisk', 'fraudRisk', 'projectRisk', 'complianceRiskProfile', 'complianceRiskPlan', 'internalaudit', 'externalaudit', 'manegeUsers'];

  if (captureSections.includes(section) && !this.selectedFinancialYear) {
    this.showYearSelection = true;
    this.pendingSection = section;
    return;
  }

  this.activeSection = section;

  // Reset dropdown if navigating to statistics
  if (section === 'statistics') {
    this.activeDropdown = null;
  }
}

currentUser: any;


  ngOnInit(): void {

     this.onResize(window); // Check initial screen size on component load

    this.currentUser = this.accountService.getUser(); // Assumes `getUser()` returns the logged-in user
 
    this.loadUser();  // Load the logged-in user's name
    this.renderChart();

    this.generateFinancialYearsBackwards(10); // Show 10 most recent years (2025/2026 to 2016/2017)


   // Load financial year only if it was previously selected
  const savedYear = localStorage.getItem('selectedFinancialYear');
  if (savedYear) {
    this.selectedFinancialYear = savedYear;
    this.showYearSelection = false;
  } else {
    this.selectedFinancialYear = null;
    this.showYearSelection = false; // don't show modal unless they try to capture data
  }
  }

  loadUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.loggedInUser = parsedUser.username;  // Display the username
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleDropdown(menu: string) {
    this.activeDropdown = this.activeDropdown === menu ? null  : menu;
  }

  renderChart() {
    const ctx = document.getElementById('statisticsChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2010', '2012', '2014', '2016'],
        datasets: [
          {
            label: 'Statistics',
            data: [50, 75, 200, 150],
            borderColor: 'blue',
            backgroundColor: 'rgba(93, 95, 239, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Comparative',
            data: [30, 55, 130, 110],
            borderColor: 'grey',
            backgroundColor: 'rgba(160, 160, 160, 0.1)',
            fill: true,
            borderDash: [5, 5],
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  showProfileDropdown = false;

  toggleProfileDropdown() {
      this.showProfileDropdown = !this.showProfileDropdown;
  }
  
  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-info')) {
          this.showProfileDropdown = false;
      }
  }
  
  logout() {
    localStorage.removeItem('selectedFinancialYear');
    // Navigate to login page
    this.router.navigate(['/login']);
}

getSectionTitle(): string {
  const sectionTitles: { [key: string]: string } = {
      statistics: 'Dashboard',
      governanceBadges: 'Governance - Badges',
      governanceButtons: 'Governance - Buttons',
      StrategicRisk: 'Strategic Risk Management',
      OperationalRisk: 'Operational Risk Management',
      fraudRisk: 'Fraud Risk Management',
      projectRisk: 'Project Risk Management',
      complianceRiskProfile: 'Compliance Universe & Risk Profile',
      complianceRiskPlan: 'Compliance Risk Management Plan',
      complianceMonitoring: 'Compliance Risk Monitoring',
      internalaudit: 'Internal Audit',
      externalaudit: 'External Audit',
      manegeUsers: 'User Management',
  };

  return sectionTitles[this.activeSection] || 'Dashboard';
}

selectedFinancialYear: string | null = null;
showYearSelection: boolean = false;

financialYears: string[] = [];

generateFinancialYearsBackwards(count: number) {
  const currentYear = new Date().getFullYear(); // e.g. 2025
  this.financialYears = Array.from({ length: count }, (_, i) => {
    const startYear = currentYear - i;
    return `${startYear}/${startYear + 1}`;
  });
}

saveFinancialYear() {
  if (this.selectedFinancialYear) {
    localStorage.setItem('selectedFinancialYear', this.selectedFinancialYear);
    this.showYearSelection = false;

    if (this.pendingSection) {
      this.activeSection = this.pendingSection;
      this.pendingSection = null;
    }
  }
}

changeFinancialYear() {
  this.showYearSelection = true;
}

isAdmin(): boolean {
  return this.currentUser?.role === 'SuperAdmin';
}

showBackButton(): boolean {
  const hiddenSections = ['statistics', 'StrategicRisk'];
  return !hiddenSections.includes(this.activeSection);
}

  // Method to navigate to the dashboard
  goToDashboard() {
    this.activeSection = 'statistics'; // Set active section to 'statistics'
    this.router.navigate(['/dashboard']); // Navigate to the dashboard
  }

}
