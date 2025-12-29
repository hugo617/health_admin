'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import './service-archive.css';

interface ServiceArchiveData {
  customerNo: string;
  channels: {
    friendIntro: boolean;
    wechatMini: boolean;
    offlineEvent: boolean;
    meituan: boolean;
    onlinePromo: boolean;
    other: boolean;
    otherText: string;
  };
  basicInfo: {
    name: string;
    sex: 'male' | 'female' | '';
    age: string;
    contact: string;
    weight: string;
    height: string;
  };
  healthHistory: {
    surgeryHistory: {
      location: string;
      time: string;
    };
    chronicDisease: string;
    medication: string;
    allergy: 'no' | 'yes' | '';
    allergyText: string;
    recentCheckup: {
      time: string;
      result: string;
    };
    pregnancyPeriod: string;
    medicalDevice: string;
  };
  subjectiveDemand: string;
  signature1: {
    customer: string;
    year: string;
    month: string;
    day: string;
  };
  signature2: {
    customer: string;
    year: string;
    month: string;
    day: string;
  };
  footer: {
    focusTopics: {
      shoulderNeck: boolean;
      insomnia: boolean;
      weightLoss: boolean;
      femaleCare: boolean;
      antiAging: boolean;
      other: boolean;
    };
    joinGroup: string;
    review: string;
    shareMoment: string;
    reward: string;
    satisfaction: string;
  };
}

const defaultData: ServiceArchiveData = {
  customerNo: '',
  channels: {
    friendIntro: false,
    wechatMini: false,
    offlineEvent: false,
    meituan: false,
    onlinePromo: false,
    other: false,
    otherText: '',
  },
  basicInfo: {
    name: '',
    sex: '',
    age: '',
    contact: '',
    weight: '',
    height: '',
  },
  healthHistory: {
    surgeryHistory: {
      location: '',
      time: '',
    },
    chronicDisease: '',
    medication: '',
    allergy: '',
    allergyText: '',
    recentCheckup: {
      time: '',
      result: '',
    },
    pregnancyPeriod: '',
    medicalDevice: '',
  },
  subjectiveDemand: '',
  signature1: {
    customer: '',
    year: '',
    month: '',
    day: '',
  },
  signature2: {
    customer: '',
    year: '',
    month: '',
    day: '',
  },
  footer: {
    focusTopics: {
      shoulderNeck: false,
      insomnia: false,
      weightLoss: false,
      femaleCare: false,
      antiAging: false,
      other: false,
    },
    joinGroup: '',
    review: '',
    shareMoment: '',
    reward: '',
    satisfaction: '',
  },
};

export default function ServiceArchivePage() {
  const router = useRouter();
  const authManager = AuthManager.getInstance();
  const [data, setData] = useState<ServiceArchiveData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tempData, setTempData] = useState<ServiceArchiveData>(defaultData);

  useEffect(() => {
    if (!authManager.requireAuth()) {
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // TODO: 调用API获取数据
      // const response = await fetch('/api/service-archive');
      // const result = await response.json();
      // setData(result.data);

      // 模拟数据 - 添加一些测试数据以便验证checkbox/radio功能
      setTimeout(() => {
        setData({
          ...defaultData,
          customerNo: 'C20240001',
          channels: {
            ...defaultData.channels,
            friendIntro: true,
            wechatMini: false,
          },
          basicInfo: {
            ...defaultData.basicInfo,
            name: '张三',
            sex: 'male',
            age: '28',
          },
          healthHistory: {
            ...defaultData.healthHistory,
            allergy: 'no',
          },
          footer: {
            ...defaultData.footer,
            focusTopics: {
              ...defaultData.footer.focusTopics,
              shoulderNeck: true,
              insomnia: false,
            },
          },
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('加载数据失败:', error);
      setShowToast(true);
      setToastMessage('加载数据失败');
      setTimeout(() => setShowToast(false), 2000);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleUpdate = () => {
    setTempData(JSON.parse(JSON.stringify(data)));
    setIsEditing(true);
    setShowToast(true);
    setToastMessage('已进入编辑模式');
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: 调用API保存数据
      // await fetch('/api/service-archive', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // 模拟保存
      console.log('保存数据:', data);
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsEditing(false);
      setShowToast(true);
      setToastMessage('保存成功');
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('保存失败:', error);
      setShowToast(true);
      setToastMessage('保存失败');
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(tempData);
    setIsEditing(false);
    setShowToast(true);
    setToastMessage('已取消编辑');
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleDownload = () => {
    setShowToast(true);
    setToastMessage('下载功能开发中');
    setTimeout(() => setShowToast(false), 2000);
  };

  const updateData = (path: string, value: any) => {
    setData((prevData) => {
      const keys = path.split('.');
      const newData = { ...prevData };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部操作按钮区域 - 优化设计 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* 返回按钮 */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>返回</span>
            </button>

            {/* 功能按钮组 */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                /* 更新按钮 */
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>更新</span>
                </button>
              ) : (
                <>
                  {/* 取消按钮 */}
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>取消</span>
                  </button>

                  {/* 保存按钮 */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-green-700 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>保存中...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>保存</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* 下载按钮 */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 active:scale-95 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>下载</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 可滚动 */}
      <div className={`max-h-[calc(100vh-140px)] overflow-y-auto ${isEditing ? 'editing-mode' : ''}`}>
        <div className="paper">
          <div className="header">
            <div className="logo-section">
              <div className="logo-box"><span></span>石墨烯健康生活馆</div>
            </div>
            <div className="company-name-right">
              <div className="cn">烯灸健康</div>
              <div className="en">XIXI HEALTH</div>
            </div>
          </div>

          <h1>烯灸客户服务档案</h1>

          <div className="customer-no">
            客户编号：
            <input
              type="text"
              className="input-line input-lg"
              value={data.customerNo}
              onChange={(e) => updateData('customerNo', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {/* 渠道来源 */}
          <div className="section">
            <div className="section-title">一、渠道来源:</div>
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  checked={data.channels.friendIntro}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.channels.friendIntro = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                {' '}朋友介绍
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.channels.wechatMini}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.channels.wechatMini = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                {' '}公众号/小程序
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.channels.offlineEvent}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.channels.offlineEvent = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                {' '}线下活动/宣传单
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.channels.meituan}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.channels.meituan = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                {' '}美团/大众
              </label>
            </div>
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  checked={data.channels.onlinePromo}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.channels.onlinePromo = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                {' '}线上推广(视频号/抖音/小红书)
              </label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '5px' }}>
                  <input
                    type="checkbox"
                    checked={data.channels.other}
                    onChange={(e) => {
                      const newData = { ...data };
                      newData.channels.other = e.target.checked;
                      // 如果取消选中"其他",清空输入框
                      if (!e.target.checked) {
                        newData.channels.otherText = '';
                      }
                      setData(newData);
                    }}
                    disabled={!isEditing}
                  />
                  {' '}其他(请注明)
                </label>
                <input
                  type="text"
                  className="input-line input-auto"
                  value={data.channels.otherText}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.channels.otherText = e.target.value;
                    setData(newData);
                  }}
                  disabled={!isEditing || !data.channels.other}
                  placeholder={data.channels.other ? '' : '请先勾选"其他"'}
                />
              </div>
            </div>
          </div>

          {/* 基础健康数据 */}
          <div className="section">
            <div className="section-title">二、基础健康数据：</div>

            <div className="sub-divider">基本信息</div>

            <div className="form-row">
              <div className="form-item">
                姓名：
                <input
                  type="text"
                  className="input-line input-md"
                  value={data.basicInfo.name}
                  onChange={(e) => updateData('basicInfo.name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-item">
                性别:
                <label style={{ margin: '0 5px 0 5px' }}>
                  <input
                    type="radio"
                    name="sex"
                    checked={data.basicInfo.sex === 'male'}
                    onChange={() => {
                      const newData = { ...data };
                      newData.basicInfo.sex = 'male';
                      setData(newData);
                    }}
                    disabled={!isEditing}
                  />
                  男
                </label>
                <label style={{ margin: '0' }}>
                  <input
                    type="radio"
                    name="sex"
                    checked={data.basicInfo.sex === 'female'}
                    onChange={() => {
                      const newData = { ...data };
                      newData.basicInfo.sex = 'female';
                      setData(newData);
                    }}
                    disabled={!isEditing}
                  />
                  女
                </label>
              </div>
              <div className="form-item">
                年龄：
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.basicInfo.age}
                  onChange={(e) => updateData('basicInfo.age', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-item" style={{ flex: 1 }}>
                联系方式：
                <input
                  type="text"
                  className="input-line"
                  style={{ width: '40%' }}
                  value={data.basicInfo.contact}
                  onChange={(e) => updateData('basicInfo.contact', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-item" style={{ marginLeft: '0em' }}>
                体重：
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.basicInfo.weight}
                  onChange={(e) => updateData('basicInfo.weight', e.target.value)}
                  disabled={!isEditing}
                />
                {' '}Kg
              </div>
              <div className="form-item">
                身高：
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.basicInfo.height}
                  onChange={(e) => updateData('basicInfo.height', e.target.value)}
                  disabled={!isEditing}
                />
                {' '}cm
              </div>
            </div>

            <div className="sub-divider">健康史筛查</div>

            <div className="form-row">
              手术史(部位：
              <input
                type="text"
                className="input-line input-md"
                value={data.healthHistory.surgeryHistory.location}
                onChange={(e) => updateData('healthHistory.surgeryHistory.location', e.target.value)}
                disabled={!isEditing}
              />
              {' '}时间：
              <input
                type="text"
                className="input-line input-md"
                value={data.healthHistory.surgeryHistory.time}
                onChange={(e) => updateData('healthHistory.surgeryHistory.time', e.target.value)}
                disabled={!isEditing}
              />
              )
            </div>
            <div className="form-row">
              慢性病：
              <input
                type="text"
                className="input-line input-auto"
                value={data.healthHistory.chronicDisease}
                onChange={(e) => updateData('healthHistory.chronicDisease', e.target.value)}
                disabled={!isEditing}
              />
              <span style={{ margin: '0 5px' }}></span>
              服药情况：
              <input
                type="text"
                className="input-line input-auto"
                value={data.healthHistory.medication}
                onChange={(e) => updateData('healthHistory.medication', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="form-row">
              过敏:
              <label style={{ margin: '0 5px' }}>
                <input
                  type="radio"
                  name="allergy"
                  checked={data.healthHistory.allergy === 'no'}
                  onChange={() => {
                    const newData = { ...data };
                    newData.healthHistory.allergy = 'no';
                    // 如果选择"否",清空过敏详情
                    if (newData.healthHistory.allergy === 'no') {
                      newData.healthHistory.allergyText = '';
                    }
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                否
              </label>
              <label style={{ margin: '0 5px' }}>
                <input
                  type="radio"
                  name="allergy"
                  checked={data.healthHistory.allergy === 'yes'}
                  onChange={() => {
                    const newData = { ...data };
                    newData.healthHistory.allergy = 'yes';
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                是
              </label>
              <input
                type="text"
                className="input-line input-auto"
                value={data.healthHistory.allergyText}
                onChange={(e) => {
                  const newData = { ...data };
                  newData.healthHistory.allergyText = e.target.value;
                  setData(newData);
                }}
                disabled={!isEditing || data.healthHistory.allergy !== 'yes'}
                placeholder={data.healthHistory.allergy === 'yes' ? '请填写过敏信息' : '选择"是"后填写'}
              />
              <span style={{ margin: '0 5px' }}></span>
              近期医院检查(时间:
              <input
                type="text"
                className="input-line input-md"
                value={data.healthHistory.recentCheckup.time}
                onChange={(e) => updateData('healthHistory.recentCheckup.time', e.target.value)}
                disabled={!isEditing}
              />
              {' '}诊断结果:
              <input
                type="text"
                className="input-line input-auto"
                value={data.healthHistory.recentCheckup.result}
                onChange={(e) => updateData('healthHistory.recentCheckup.result', e.target.value)}
                disabled={!isEditing}
              />
              )
            </div>
            <div className="form-row">
              孕期/月经期/体内肿瘤{' '}
              <input
                type="text"
                className="input-line input-auto"
                value={data.healthHistory.pregnancyPeriod}
                onChange={(e) => updateData('healthHistory.pregnancyPeriod', e.target.value)}
                disabled={!isEditing}
              />
              <span style={{ margin: '0 5px' }}></span>
              植入医疗设备{' '}
              <input
                type="text"
                className="input-line input-auto"
                value={data.healthHistory.medicalDevice}
                onChange={(e) => updateData('healthHistory.medicalDevice', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="sub-divider">客户主观诉求</div>
            <center style={{ marginBottom: '20px', padding: '0 1.5em', color: '#777', fontSize: '12px' }}>
              (例:肩颈酸痛持续3个月,睡眠质量差,美容等)
            </center>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #000', margin: '30px 0' }} />

          {/* 禁忌症告知 */}
          <div className="section">
            <div style={{ textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
              禁忌症告知
            </div>
            <div className="warning-box">
              以下人群不建议使用本烯灸服务:怀孕女士、女性经期、严重高血压&gt;140/90mmHg、体内植入电子医疗设备(如心脏起搏器)、癌症晚期、正在发烧、醉酒后、过饿或过饱、重疾者、年老体弱者。
            </div>

            <div className="declaration">
              本人确认:已阅读禁忌症清单且不属于任何禁忌人群,理解烯灸非医疗行为,自愿承担因隐瞒病史导致的后果。
            </div>

            <div className="signature-area">
              <div className="sign-item">
                客户签名:
                <input
                  type="text"
                  className="input-line input-md"
                  value={data.signature1.customer}
                  onChange={(e) => updateData('signature1.customer', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="sign-item">
                日期:
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.signature1.year}
                  onChange={(e) => updateData('signature1.year', e.target.value)}
                  disabled={!isEditing}
                />
                年
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.signature1.month}
                  onChange={(e) => updateData('signature1.month', e.target.value)}
                  disabled={!isEditing}
                />
                月
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.signature1.day}
                  onChange={(e) => updateData('signature1.day', e.target.value)}
                  disabled={!isEditing}
                />
                日
              </div>
            </div>
          </div>

          {/* 数据授权 */}
          <div className="section">
            <div className="declaration" style={{ fontWeight: 'normal' }}>
              本人授权烯灸公司使用本人的数据用于个性化服务制定。(您的健康数据存储期为服务终止后2年,届满后将匿名化处理。)
            </div>
            <div className="signature-area">
              <div className="sign-item">
                客户签名:
                <input
                  type="text"
                  className="input-line input-md"
                  value={data.signature2.customer}
                  onChange={(e) => updateData('signature2.customer', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="sign-item">
                日期:
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.signature2.year}
                  onChange={(e) => updateData('signature2.year', e.target.value)}
                  disabled={!isEditing}
                />
                年
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.signature2.month}
                  onChange={(e) => updateData('signature2.month', e.target.value)}
                  disabled={!isEditing}
                />
                月
                <input
                  type="text"
                  className="input-line input-sm"
                  value={data.signature2.day}
                  onChange={(e) => updateData('signature2.day', e.target.value)}
                  disabled={!isEditing}
                />
                日
              </div>
            </div>
          </div>

          {/* 底部区域 */}
          <div className="footer-area">
            <div className="footer-row">
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>重点关注话题:</span>
              <label>
                <input
                  type="checkbox"
                  checked={data.footer.focusTopics.shoulderNeck}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.footer.focusTopics.shoulderNeck = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                肩颈养护
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.footer.focusTopics.insomnia}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.footer.focusTopics.insomnia = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                失眠改善
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.footer.focusTopics.weightLoss}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.footer.focusTopics.weightLoss = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                减肥排毒
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.footer.focusTopics.femaleCare}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.footer.focusTopics.femaleCare = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                女性调理
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.footer.focusTopics.antiAging}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.footer.focusTopics.antiAging = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                抗衰美容
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.footer.focusTopics.other}
                  onChange={(e) => {
                    const newData = { ...data };
                    newData.footer.focusTopics.other = e.target.checked;
                    setData(newData);
                  }}
                  disabled={!isEditing}
                />
                其他
              </label>
            </div>

            <div className="footer-row">
              <div style={{ width: '45%', display: 'flex', marginRight: '5%' }}>
                加群:
                <input
                  type="text"
                  className="input-line input-auto"
                  value={data.footer.joinGroup}
                  onChange={(e) => updateData('footer.joinGroup', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div style={{ width: '50%', display: 'flex' }}>
                写/发评价:
                <input
                  type="text"
                  className="input-line input-auto"
                  value={data.footer.review}
                  onChange={(e) => updateData('footer.review', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="footer-row">
              朋友圈分享:
              <input
                type="text"
                className="input-line input-auto"
                value={data.footer.shareMoment}
                onChange={(e) => updateData('footer.shareMoment', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="footer-row">
              <div style={{ width: '45%', display: 'flex', marginRight: '5%' }}>
                奖励发放:
                <input
                  type="text"
                  className="input-line input-auto"
                  value={data.footer.reward}
                  onChange={(e) => updateData('footer.reward', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div style={{ width: '50%', display: 'flex' }}>
                回访满意度及建议:
                <input
                  type="text"
                  className="input-line input-auto"
                  value={data.footer.satisfaction}
                  onChange={(e) => updateData('footer.satisfaction', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="internal-mark">
            内部资料,外泄必究
          </div>
        </div>
      </div>

      {/* 底部安全区域 */}
      <div className="h-safe-bottom"></div>

      {/* Toast 提示 */}
      {showToast && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
