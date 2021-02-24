import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Icon, Card, Label } from 'semantic-ui-react';
import {
  Patient,
  HealthCheckRating,
  HospitalEntry,
  HealthCheckEntry,
  OccupationalHealthcareEntry,
  Diagnosis,
  EntryForm
} from '../types';
import { apiBaseUrl } from '../constants';
import { useStateValue, updatePatient } from '../state';
import { Gender } from '../types';
import NewEntryForm from './AddEntryForm';


const Diagnoses: React.FC<{
  codes: string[];
  allDiagnoses: Diagnosis[];
}> = ({ codes, allDiagnoses }) => (<>
  <h4>Diagnoses</h4>
  <ul>
    {codes.map((code) => {
      const diagnose = allDiagnoses.find((d) => d.code === code);
      if (!diagnose) return null;
      return (
        <li key={diagnose.code}>
          {diagnose.code}: {diagnose.name}{' '}
          {diagnose.latin && `(${diagnose.latin})`}
        </li>
      );
    })}
  </ul>
</>);

const HospitalEntryReport: React.FC<{
  entry: HospitalEntry;
  allDiagnoses: Diagnosis[];
}> = ({ entry, allDiagnoses }) => {
  return (
    <Card style={{minWidth: 500}} key={entry.id}>
      <Card.Content>
        <Card.Header>
          {entry.date}
          <Label color="red" tag>
            Hospital
          </Label>
        </Card.Header>
        <Card.Meta>
          <span className="date">{entry.specialist}</span>
        </Card.Meta>
        <Card.Description>
          <p>{entry.description}</p>
          <div>
            {entry.diagnosisCodes ? (
              <Diagnoses
                codes={entry.diagnosisCodes}
                allDiagnoses={allDiagnoses}
              />
            ) : null}
          </div>

          <p>
            {entry.discharge.date} - {entry.discharge.criteria}
          </p>
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

const OccupationalHealthcareReport: React.FC<{
  entry: OccupationalHealthcareEntry;
  allDiagnoses: Diagnosis[];
}> = ({ entry, allDiagnoses }) => {
  return (
    <Card style={{minWidth: 500}} key={entry.id}>
      <Card.Content>
        <Card.Header>
          {entry.date}
          <Label color="teal" tag>
            Occupational
          </Label>
        </Card.Header>
        <Card.Meta>
          <span className="date">{entry.specialist}</span>
        </Card.Meta>
        <Card.Description>
          <p>{entry.description}</p>
          <div>
            {entry.diagnosisCodes ? (
              <Diagnoses
                codes={entry.diagnosisCodes}
                allDiagnoses={allDiagnoses}
              />
            ) : null}
          </div>
          <p>
            {entry.employerName ? `${entry.employerName} - ` : null}
            {entry.sickLeave
              ? `Sick leave from ${entry.sickLeave.startDate} to ${entry.sickLeave.endDate}`
              : null}
          </p>
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

const HealthCheckLevelIcon: React.FC<{
  level: HealthCheckRating;
}> = ({ level }) => {
  switch (level) {
    case HealthCheckRating.Healthy:
      return <Icon name="heart" color="green" />;
    case HealthCheckRating.LowRisk:
      return <Icon name="heart" color="yellow" />;
    case HealthCheckRating.HighRisk:
      return <Icon name="heart" color="orange" />;
    case HealthCheckRating.CriticalRisk:
      return <Icon name="heart" color="red" />;
    default:
      return null;
  }
};

const HealthCheckEntryReport: React.FC<{
  entry: HealthCheckEntry;
  allDiagnoses: Diagnosis[];

}> = ({ entry, allDiagnoses }) => {
  return (
    <Card style={{minWidth: 500}} key={entry.id}>
      <Card.Content>
        <Card.Header>
          {entry.date}
          <Label color="green" tag>
            Health check
          </Label>
        </Card.Header>
        <Card.Meta>
          <span className="date">{entry.specialist}</span>
        </Card.Meta>
        <Card.Description>
          <p>
            <HealthCheckLevelIcon level={entry.healthCheckRating} />
            {entry.description}
          </p>
          <div>
            {entry.diagnosisCodes ? (
              <Diagnoses
                codes={entry.diagnosisCodes}
                allDiagnoses={allDiagnoses}
              />
            ) : null}
          </div>
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

const isEmpty = (obj: object) =>
  obj && Object.keys(obj).length === 0 && obj.constructor === Object;

const PatientListPage: React.FC = () => {
  const [{ patients, diagnoses }, dispatch] = useStateValue();
  const [errorMessage, setErrorMessage] = useState('');
  const { id } = useParams<{ id: string }>();

  const patient = patients[id] || null;

  const submitEntry = async (formData: EntryForm) => {
    try {
      const { data } = await axios.post<Patient>(`${apiBaseUrl}/patients/${id}/entries`, formData);
      dispatch(updatePatient(data));
    } catch(e) {
      console.log(e);
      setErrorMessage(`Error: ${e.response.data}`);
    }
  };

  React.useEffect(() => {
    const fetchPatient = async (id: string) => {
      try {
        const { data } = await axios.get<Patient>(
          `${apiBaseUrl}/patients/${id}`,
        );
        dispatch(updatePatient({ ...data, publicPatient: false }));
      } catch (e) {
        console.error(e);
      }
    };
    if (patient && patient.publicPatient) fetchPatient(id);
  }, [dispatch, id]) //eslint-disable-line

  if (isEmpty(patients)) return <h1>Loading</h1>;
  if (!patient && !isEmpty(patients))
    return <h1>Patient not found</h1>;
  return (
    <div className="App">
      <h3>
        {patient.name}{' '}
        <Icon
          name={
            patient.gender === Gender.Male
              ? 'venus'
              : patient.gender === Gender.Female
              ? 'mars'
              : 'genderless'
          }
        />
      </h3>
      {patient.ssn ? <p>ssn: {patient.ssn}</p> : null}
      <p>Occupation: {patient.occupation}</p>
      {(patient.entries || []).map((e) => {
        switch (e.type) {
          case 'Hospital':
            return (
              <HospitalEntryReport
                entry={e}
                key={e.id}
                allDiagnoses={diagnoses}
              />
            );
          case 'OccupationalHealthcare':
            return (
              <OccupationalHealthcareReport
                entry={e}
                key={e.id}
                allDiagnoses={diagnoses}
              />
            );
          case 'HealthCheck':
            return (
              <HealthCheckEntryReport
                entry={e}
                key={e.id}
                allDiagnoses={diagnoses}
              />
            );
          default:
            return null;
        }
      })}
      <Card style={{minWidth: 500, padding: '1.75rem 1rem'}}>
        <h3>Add new entry for patient</h3>
        <NewEntryForm onSubmit={submitEntry} error={errorMessage} />
      </Card>
    </div>
  );
};

export default PatientListPage;
