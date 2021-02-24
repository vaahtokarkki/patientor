import React from 'react';
import { Grid, Button, Message } from 'semantic-ui-react';
import { Field, Formik, Form } from 'formik';
import { useStateValue } from '../state';

import {
  TextField,
  SelectField,
  EntryTypeOption,
  HealthCheckRatingOption,
  DiagnosisSelection,
} from '../AddPatientModal/FormField';
import { EntryType, HealthCheckRating, EntryForm } from '../types';

interface Props {
  onSubmit: (values: EntryForm) => void;
  error: string;
}

const entryTypeOptions: EntryTypeOption[] = [
  { value: EntryType.HealthCheck, label: 'Health check' },
  { value: EntryType.Hospital, label: 'Hospital' },
  {
    value: EntryType.OccupationalHealthcare,
    label: 'Occupational healthcare',
  },
];

const healthCheckRatingOptions: HealthCheckRatingOption[] = [
  { value: HealthCheckRating.CriticalRisk, label: 'Critical risk' },
  { value: HealthCheckRating.HighRisk, label: 'Hight risk' },
  { value: HealthCheckRating.LowRisk, label: 'Low risk' },
  { value: HealthCheckRating.Healthy, label: 'Healthy' },
];

const AddEntryForm: React.FC<Props> = ({ onSubmit, error }) => {
  const [{ diagnoses }] = useStateValue();

  const baseFields = (
    <>
      <SelectField
        label="Entry type"
        name="type"
        options={entryTypeOptions}
      />
      <Field
        label="Description"
        placeholder="Description"
        name="description"
        component={TextField}
      />
      <Field
        label="Date of entry"
        placeholder="YYYY-MM-DD"
        name="date"
        component={TextField}
      />

      <Field
        label="Specialist"
        placeholder="Specialist"
        name="specialist"
        component={TextField}
      />
    </>
  );

  const healthCheckFields = (
    <SelectField
      label="Health check rating"
      name="healthCheckRating"
      options={healthCheckRatingOptions}
    />
  );

  const hospitalFields = (
    <>
      <Field
        label="Discharge date"
        placeholder="YYYY-MM-DD"
        name="dischargeDate"
        component={TextField}
      />
      <Field
        label="Discharge criteria"
        placeholder="Criteria"
        name="dischargeCriteria"
        component={TextField}
      />
    </>
  );

  const OccupationalHealthcareFields = (
    <>
      <Field
        label="Employee name"
        placeholder="Name"
        name="employeeName"
        component={TextField}
      />
      <Field
        label="Sick leave start"
        placeholder="YYYY-MM-DD"
        name="sickLeaveStart"
        component={TextField}
      />
      <Field
        label="Sickleave end"
        placeholder="YYYY-MM-DD"
        name="sickLeaveEnd"
        component={TextField}
      />
    </>
  );

  return (
    <>
      {error ? <Message content={error} error /> : null}
      <Formik
        initialValues={{
          description: '',
          date: '',
          specialist: '',
          diagnosisCodes: [],
          type: 'HealthCheck',
          healthCheckRating: HealthCheckRating.Healthy,
        }}
        onSubmit={onSubmit}
        validate={(values) => {
          const requiredError = 'Field is required';
          const errors: { [field: string]: string } = {};
          if (!values.description) {
            errors.name = requiredError;
          }
          if (!values.date) {
            errors.date = requiredError;
          }
          if (!values.specialist) {
            errors.specialist = requiredError;
          }

          if (
            values.type === 'HealthCheck' &&
            !values.healthCheckRating
          )
            return errors;
        }}
      >
        {({
          isValid,
          dirty,
          values,
          setFieldValue,
          setFieldTouched,
          resetForm,
        }) => {
          return (
            <Form className="form ui">
              {baseFields}
              {values.type === 'HealthCheck' && healthCheckFields}
              {values.type === 'Hospital' && hospitalFields}
              {values.type === 'OccupationalHealthcare' &&
                OccupationalHealthcareFields}
              <DiagnosisSelection
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                diagnoses={Object.values(diagnoses)}
              />
              <Grid>
                <Grid.Column floated="left" width={5}>
                  <Button
                    type="button"
                    onClick={() => resetForm()}
                    color="red"
                  >
                    Reset
                  </Button>
                </Grid.Column>
                <Grid.Column floated="right" width={5}>
                  <Button
                    type="submit"
                    floated="right"
                    color="green"
                    disabled={!dirty || !isValid}
                  >
                    Add
                  </Button>
                </Grid.Column>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default AddEntryForm;
