import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useI18n } from '../contexts/LanguageContext';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <Layout title={t('notFound.title')} noindex>
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16">
        <EmptyState
          title={t('notFound.title')}
          description={t('notFound.desc')}
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/">
                <Button variant="primary">{t('notFound.backHome')}</Button>
              </Link>
              <Link to="/products">
                <Button variant="secondary">{t('common.browseProducts')}</Button>
              </Link>
            </div>
          }
        />
      </div>
    </Layout>
  );
}
