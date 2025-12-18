
import React from 'react';

export const AGE_GROUPS = ['30대', '40대', '50대', '60대'];
export const FORMATS = ['라디오 사연', '유튜브 낭독', '상담형 토크', '웃픈 사연', '사이다(권선징악)', '가족애'];
export const LENGTHS = ['20초', '30초', '45초', '60초', '2~3분', '5~7분', '10분', '15분', '30분'];
export const TONES = ['따뜻함', '담담함', '위트', '단호함', '눈물', '사이다'];
export const INTENSITIES = ['순한맛', '현실적', '강한 사이다'];

export const EMOTIONS = ['후회', '분노', '공허', '위로', '반전', '사이다', '향수', '감동', '서러움'];
export const RELATIONSHIPS = ['배우자', '부모', '자녀', '상사', '동료', '친구', '시댁', '처가', '형제'];

export const TOPIC_PRESETS = [
  { id: 'family', label: '가정(부부/부모/자녀)', icon: <i className="fas fa-home"></i>, color: 'from-blue-500 to-cyan-500' },
  { id: 'work', label: '직장(상사/동료/은퇴)', icon: <i className="fas fa-briefcase"></i>, color: 'from-indigo-500 to-purple-500' },
  { id: 'health', label: '건강·노화', icon: <i className="fas fa-heart-pulse"></i>, color: 'from-red-400 to-rose-600' },
  { id: 'money', label: '돈·경제', icon: <i className="fas fa-coins"></i>, color: 'from-yellow-400 to-amber-600' },
  { id: 'divorce', label: '이혼·사별 이후', icon: <i className="fas fa-cloud"></i>, color: 'from-slate-400 to-slate-600' },
  { id: 'family_ext', label: '가족 확장 갈등(시댁/형제)', icon: <i className="fas fa-people-group"></i>, color: 'from-orange-400 to-red-500' },
  { id: 'relation', label: '인간관계 전반', icon: <i className="fas fa-users"></i>, color: 'from-teal-400 to-emerald-500' },
  { id: 'identity', label: '정체성·존재감', icon: <i className="fas fa-user-gear"></i>, color: 'from-violet-400 to-purple-600' },
  { id: 'dream', label: '꿈·두 번째 인생', icon: <i className="fas fa-star"></i>, color: 'from-yellow-300 to-orange-400' },
  { id: 'care', label: '돌봄 노동', icon: <i className="fas fa-hands-holding-child"></i>, color: 'from-pink-400 to-rose-500' },
  { id: 'values', label: '가치관·세대 충돌', icon: <i className="fas fa-bridge-circle-exclamation"></i>, color: 'from-cyan-400 to-blue-500' },
  { id: 'secret', label: '비밀·죄책감', icon: <i className="fas fa-user-secret"></i>, color: 'from-gray-600 to-black' },
  { id: 'love', label: '연애/재혼', icon: <i className="fas fa-heart"></i>, color: 'from-pink-500 to-rose-500' },
  { id: 'parenting', label: '육아/출산', icon: <i className="fas fa-baby"></i>, color: 'from-orange-500 to-amber-500' },
  { id: 'inner', label: '내면(번아웃/공허/자존감)', icon: <i className="fas fa-spa"></i>, color: 'from-teal-500 to-emerald-500' },
  { id: 'justice', label: '사이다(권선징악/손절)', icon: <i className="fas fa-bolt"></i>, color: 'from-yellow-500 to-orange-500' },
];

export const EMOTION_CURVES = [
  '상실·회한',
  '갈등→화해',
  '소외→회복',
  '인정욕구',
  '향수',
  '사이다 응징'
];
