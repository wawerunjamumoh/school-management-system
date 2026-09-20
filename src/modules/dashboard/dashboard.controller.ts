import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthClaims } from '../auth/auth.service.js';
import { DashboardService } from './dashboard.service.js';

@Controller()
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard')
  async summary(@Request() request: { auth: AuthClaims }) {
    return await this.dashboard.summary(request.auth);
  }

  @Get('students/:studentId/results')
  async results(@Param('studentId') studentId: string, @Request() request: { auth: AuthClaims }) {
    return await this.dashboard.studentResults(request.auth, studentId);
  }
}
