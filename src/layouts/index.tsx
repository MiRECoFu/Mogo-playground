import { Link, Outlet } from 'umi';
import styles from './index.less';

export default function Layout() {
  return (
    <div className={styles.main}>
      <div className={styles.navs}>
        <div className={styles.logo}>
          Mogo
        </div>  
      </div>
      <div style={{ width: '100%', flex: 1}}>
        <Outlet />
      </div>
      
    </div>
    
  );
}
