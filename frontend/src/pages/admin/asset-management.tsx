import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Added import
import AdminSidebar from '../../components/admin/AdminSidebar';
import Navbar from '../../components/common/Navbar';
import { AssetProvider } from '../../contexts/AssetContext';
import AdminAssetsTable from '../../components/admin/AdminAssetsTable';
import AdminRoute from '../../components/auth/AdminRoute';
import BarcodeScanner from '../../components/common/BarcodeScanner';
import AssetDetailPopup from '../../components/common/AssetDetailPopup';
import Layout from '../../components/common/Layout';
import { axiosInstance } from '../../lib/axios';

const AssetManagementPage: React.FC = () => {
  const router = useRouter(); // Added router
  const { status: statusFilter } = router.query; // Extract statusFilter from URL
  

  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedAsset, setScannedAsset] = useState(null);
  const [showAssetPopup, setShowAssetPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState(''); // เพิ่ม state สำหรับ search

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      console.log(`Barcode detected in admin page: "${barcode}"`);
      setShowScanner(false);
      const response = await axiosInstance.get(`/api/assets/barcode/${encodeURIComponent(barcode)}`);
      console.log('Asset found:', response.data);
      setScannedAsset(response.data);
      setShowAssetPopup(true);
    } catch (err: unknown) {
      console.error('Error finding asset:', err instanceof Error ? err.message : 'Unknown error');
      setShowScanner(false);
      setShowAssetPopup(false);
    }
  };

  const handleCloseAssetPopup = () => {
    setShowAssetPopup(false);
    setScannedAsset(null);
  };

  return (
    <AdminRoute>
      <>
        <Head>
          <title>Asset Management - Admin Dashboard</title>
          <meta name="description" content="Comprehensive asset management for administrators" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Layout sidebar={<AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}>
          <AssetProvider>
            <Navbar
              title="Asset Management"
              onMenuClick={() => setSidebarOpen(true)}
              onSearch={setSearchTerm} // ส่งฟังก์ชันนี้ให้ Navbar
            />
            <div> 
              <AdminAssetsTable 
                onScanBarcodeClick={handleOpenScanner} 
                searchTerm={searchTerm} 
                onSearch={setSearchTerm}
                initialStatusFilter={statusFilter as string} // Pass prop
              />
            </div>
          </AssetProvider>
        </Layout>

        {/* Barcode Scanner Modal */}
        {showScanner && (
          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onClose={handleCloseScanner}

          />
        )}
        {/* Asset Detail Popup */}
        {showAssetPopup && scannedAsset && (
          <AssetDetailPopup
            asset={scannedAsset}
            isOpen={showAssetPopup}
            onClose={handleCloseAssetPopup}
            isCreating={false}
            showUserEdit={true}
          />
        )}
      </>
    </AdminRoute>
  );
};

export default AssetManagementPage; 