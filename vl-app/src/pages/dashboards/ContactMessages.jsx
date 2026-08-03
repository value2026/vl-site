import { useAuth } from '../../context/AuthContext';
import SurveyResponsesView from '../../components/dashboard/SurveyResponsesView';

export default function ContactMessages() {
  const { token, API_URL } = useAuth();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <SurveyResponsesView pageSlug="contact" token={token} API_URL={API_URL} />
    </div>
  );
}
