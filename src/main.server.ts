import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

// const bootstrap = () => bootstrapApplication(AppComponent, config);

// export default bootstrap;

const bootstrap = () => bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
  ]
});

export default bootstrap;
