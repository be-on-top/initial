import { NgModule, Sanitizer } from '@angular/core';

// à voir
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EvaluatorsListComponent } from './Evaluators/evaluators-list/evaluators-list.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EditorModule } from '@tinymce/tinymce-angular'; // Import du module EditorModule
import { AddEvaluatorComponent } from './Evaluators/add-evaluator/add-evaluator.component';
import { EvaluatorDetailsComponent } from './Evaluators/evaluator-details/evaluator-details.component';
import { UpdateEvaluatorComponent } from './Evaluators/update-evaluator/update-evaluator.component';
import { PriorFormComponent } from './Questions/priors/prior-form/prior-form.component';
import { QuestionDetailsComponent } from './Questions/priors/question-details/question-details.component';
import { QuestionsListComponent } from './Questions/priors/questions-list/questions-list.component';
import { UpdateQuestionComponents } from './Questions/priors/update-question/update-question.component';
import { SocialFormComponent } from './Questions/socials/social-form/social-form.component';
import { SocialsListComponent } from './Questions/socials/socials-list/socials-list.component';
import { UpdateSocialComponent } from './Questions/socials/update-social/update-social.component';
import { SocialDetailsComponent } from './Questions/socials/social-details/social-details.component';
import { FullFormComponent } from './Questions/fulls/full-form/full-form.component';
import { FullListComponent } from './Questions/fulls/full-list/full-list.component';
import { FullDetailsComponent } from './Questions/fulls/full-details/full-details.component';
import { UpdateFullComponent } from './Questions/fulls/update-full/update-full.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from '../register/register.component';
import { AuthGuardService } from '../auth-guard.service';
import { SearchComponent } from '../search/search.component';
import { StudentDetailsComponent } from './Students/student-details/student-details.component';
import { StudentsListComponent } from './Students/students-list/students-list.component';
import { UpdateStudentComponent } from './Students/update-student/update-student.component';
import { FeedbackMessagesComponent } from '../feedback-messages/feedback-messages.component';
import { AddTrainerComponent } from './Trainers/add-trainer/add-trainer.component';
import { TrainersListComponent } from './Trainers/trainers-list/trainers-list.component';
import { TrainerDetailsComponent } from './Trainers/trainer-details/trainer-details.component';
import { UpdateTrainerComponent } from './Trainers/update-trainer/update-trainer.component';
// essai mutualisation du ts et template
import { UsersListComponent } from './shared/users-list.component';
import { SettingsComponent } from './settings/settings/settings.component';
import { UserDetailsComponent } from './Users/user-details/user-details.component';
import { UpdateUserComponent } from './Users/update-user/update-user.component';
import { AddUserComponent } from './Users/add-user/add-user.component';
// import { AccountComponent } from '../account/account.component';
import { RoleGuardGuard } from '../role-guard.guard';
import { UpdateSettingsComponent } from './settings/update-settings/update-settings.component';
import { SettingsListComponent } from './settings/settings-list/settings-list.component';
import { UpdateTradesComponent } from './settings/update-trades/update-trades.component';
// import { UpdateFollowUpComponent } from './Follow-up/update-follow-up/update-follow-up.component';
import { MyStudentsComponent } from './Follow-up/my-students/my-students.component';
import { AddFollowUpComponent } from './Follow-up/add-follow-up/add-follow-up.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { CoverImageComponent } from './settings/update-trades/cover-image/cover-image.component';
import { TutorDetailsComponent } from './Tutors/tutor-details/tutor-details.component';
import { TutorsListComponent } from './Tutors/tutors-list/tutors-list.component';
import { UpdateTutorComponent } from './Tutors/update-tutor/update-tutor.component';
import { AddTutorComponent } from './Tutors/add-tutor/add-tutor.component';
import { DecodeURIPipe } from './Questions/decode-uri.pipe';



const routesAdmin: Routes = [

  {
    path: 'admin', children: [
      // essai mutualisation des vues pour la liste des formateurs + trainers
      // { path: 'evaluators', component: EvaluatorsListComponent },
      { path: 'evaluators', component: UsersListComponent, data: { user: 'evaluator' } },
      { path: 'addEvaluator', component: AddEvaluatorComponent },
      { path: 'evaluator/:id', component: EvaluatorDetailsComponent },
      { path: 'updateEvaluator/:id', component: UpdateEvaluatorComponent },
      // essai mutualisation des vues pour la liste des formateurs + trainers
      // { path: 'trainers', component: TrainersListComponent },
      { path: 'trainers', component: UsersListComponent, data: { user: 'trainer' } },
      { path: 'addTrainer', component: AddTrainerComponent },
      // essai mutualisation des vues pour le détail depuis la liste des evaluateurs + formateurs
      // { path: 'trainer/:id', component: TrainerDetailsComponent },
      { path: 'trainer/:id', component: TrainerDetailsComponent },
      { path: 'updateTrainer/:id', component: UpdateTrainerComponent },
      // { path: 'tutors', component: TutorsListComponent },
      { path: 'tutors', component: UsersListComponent, data: { user: 'tutor' } },
      { path: 'addTutor', component: AddTutorComponent},
      { path: 'tutor/myStudents', component: MyStudentsComponent, data: { user: 'tutor' } },
      { path: 'tutor/:id', component: TutorDetailsComponent },
      { path: 'updateTutor/:id', component: UpdateTutorComponent },

      // l'éditeur est générique pour l'esssai. on va conserver une route distincte pour le moment (?)
      { path: 'users', component: UsersListComponent, data: { user: 'editor' } },
      { path: 'addUser', component: AddUserComponent },
      { path: 'user/:id', component: UserDetailsComponent },
      { path: 'updateUser/:id', component: UpdateUserComponent },
      { path: 'students', component: StudentsListComponent },
      { path: 'student/:id', component: StudentDetailsComponent, data: { user: 'admin' } },
      { path: 'updateStudent/:id/:editKey', component: UpdateStudentComponent, data: { user: 'admin' } },
      { path: 'priorForm', component: PriorFormComponent },
      { path: 'questions', component: QuestionsListComponent },
      { path: 'questionDetails', component: QuestionDetailsComponent },
      { path: 'updateQuestion/:id', component: UpdateQuestionComponents },
      { path: 'socialForm', component: SocialFormComponent },
      { path: 'socials', component: SocialsListComponent },
      { path: 'updateSocial/:id', component: UpdateSocialComponent },
      { path: 'fullForm', component: FullFormComponent },
      { path: 'fullList', component: FullListComponent },
      { path: 'fullDetails', component: FullDetailsComponent },
      { path: 'updateFull/:id', component: UpdateFullComponent },
      { path: 'addSettings', component: SettingsComponent },
      { path: 'settings', component: SettingsListComponent },
      { path: 'updateTrades/:id', component: UpdateTradesComponent, data: { user: 'admin' } },
      { path: 'updateSettings', component: UpdateSettingsComponent },
      { path: 'myStudents', component: MyStudentsComponent, data: { user: 'trainer' }},
      // { path: 'trainer/myStudents', component: MyStudentsComponent, data: { user: 'trainer' } },
      { path: 'myStudentDetails/:id', component: StudentDetailsComponent, data: { user: 'trainer' } },
      // { path: 'trainer/myStudentDetails/:id', component: StudentDetailsComponent, data: { user: 'trainer' } },
      { path: 'tutor/myStudentDetails/:id', component: StudentDetailsComponent, data: { user: 'tutor' } },
      { path: 'addStudentEvaluation/:id', component: AddFollowUpComponent, data: { user: 'trainer' } },
      { path: 'addStudentTutorial/:id', component: AddFollowUpComponent, data: { user: 'tutor' } },
      { path: 'updateEvaluation/:id/:evaluationKey', component: UpdateStudentComponent, data: { user: 'trainer' } },
      { path: 'updateTutorial/:id/:tutorialKey', component: UpdateStudentComponent, data: { user: 'tutor' } },
      { path: 'updateDescription/:id/:role', component: UpdateTradesComponent, data: { user: 'editor' } },
      { path: 'updateTradeImage/:id', component: CoverImageComponent }

    ],
    // canActivate: [AuthGuardService]
    canActivate: [AuthGuardService, RoleGuardGuard], data: {
      expectedRoles: ['evaluator', 'admin', 'trainer', 'tutor', 'editor']
    }
  },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }

];

@NgModule({
  declarations: [
    DecodeURIPipe,
    EvaluatorsListComponent,
    AddEvaluatorComponent,
    EvaluatorDetailsComponent,
    UpdateEvaluatorComponent, PriorFormComponent, QuestionDetailsComponent, QuestionsListComponent, UpdateQuestionComponents, SocialFormComponent, SocialsListComponent, UpdateSocialComponent, SocialDetailsComponent, FullFormComponent, FullListComponent, FullDetailsComponent, UpdateFullComponent, LoginComponent, SearchComponent, StudentDetailsComponent, StudentsListComponent, UpdateStudentComponent, FeedbackMessagesComponent, AddTrainerComponent, TrainersListComponent, TrainerDetailsComponent, UpdateTrainerComponent, UsersListComponent, SettingsComponent, AddUserComponent, UserDetailsComponent, UpdateUserComponent, UpdateSettingsComponent, UpdateTradesComponent, MyStudentsComponent, AddFollowUpComponent, TooltipComponent, CoverImageComponent, TutorDetailsComponent, TutorsListComponent, UpdateTutorComponent, AddTutorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routesAdmin),
    EditorModule
  ],
  exports: [
    FeedbackMessagesComponent,
    TooltipComponent,
    CoverImageComponent
  ]


})

export class AdminModule { }

