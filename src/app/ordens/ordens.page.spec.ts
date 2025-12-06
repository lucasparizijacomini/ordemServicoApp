/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OrdensPage } from './ordens.page';

describe('OrdensComponent', () => {
  let component: OrdensPage;
  let fixture: ComponentFixture<OrdensPage>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ OrdensPage ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdensPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
