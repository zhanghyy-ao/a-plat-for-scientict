import React, { useState } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Button from '../common/Button';
import { FormGroup, Input, Textarea } from '../common/Form';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = '请输入主题';
    }
    if (!formData.message.trim()) {
      newErrors.message = '请输入留言内容';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // 模拟提交
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        // 3秒后重置成功状态
        setTimeout(() => setSubmitSuccess(false), 3000);
      }, 1500);
    }
  };

  const contactInfo = [
    {
      title: '地址',
      value: '计算机学院大楼 501室',
      icon: '📍',
    },
    {
      title: '电话',
      value: '(010) 12345678',
      icon: '📞',
    },
    {
      title: '邮箱',
      value: 'lab@computer.edu.cn',
      icon: '✉️',
    },
    {
      title: '邮编',
      value: '100000',
      icon: '📮',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="联系方式" subtitle="如有任何问题或合作意向，欢迎随时联系我们" />

      {/* 联系信息和地图 */}
      <section className="py-20 bg-dark-gray/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-orbitron font-semibold mb-6 text-electric-blue">
                联系信息
              </h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="text-2xl mt-1">{info.icon}</div>
                    <div>
                      <h4 className="font-orbitron font-medium mb-1">{info.title}</h4>
                      <p className="text-light-gray">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h4 className="font-orbitron font-medium mb-4">实验室位置</h4>
                <div className="rounded-lg overflow-hidden h-64 border border-light-gray/10">
                  {/* 这里可以嵌入地图，暂时使用占位图 */}
                  <img
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20campus%20map%20with%20computer%20science%20building%20marked&image_size=landscape_16_9"
                    alt="实验室位置"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-dark-gray/80 border border-light-gray/10 rounded-lg p-8"
            >
              <h3 className="text-2xl font-orbitron font-semibold mb-6 text-electric-blue">
                留言表单
              </h3>
              {submitSuccess ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">✅</div>
                  <h4 className="text-xl font-semibold mb-2">留言提交成功！</h4>
                  <p className="text-light-gray">我们会尽快回复您。</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <FormGroup label="姓名" error={errors.name}>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="请输入您的姓名"
                      error={errors.name}
                    />
                  </FormGroup>
                  <FormGroup label="邮箱" error={errors.email}>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="请输入您的邮箱"
                      error={errors.email}
                    />
                  </FormGroup>
                  <FormGroup label="主题" error={errors.subject}>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="请输入留言主题"
                      error={errors.subject}
                    />
                  </FormGroup>
                  <FormGroup label="留言内容" error={errors.message}>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="请输入您的留言内容"
                      rows={5}
                      error={errors.message}
                    />
                  </FormGroup>
                  <Button
                    type="submit"
                    fullWidth
                    loading={isSubmitting}
                    className="mt-6"
                  >
                    提交留言
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;