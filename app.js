// State Awal Aplikasi
        let state = {
            contacts: [
                { id: 1, name: "Budi Santoso", email: "budi.santoso@nexus.co.id", company: "PT Nexus Utama", tag: "VIP", status: "Subscribed" },
                { id: 2, name: "Siti Rahmawati", email: "siti@vertex.id", company: "Vertex Indonesia", tag: "Lead", status: "Subscribed" },
                { id: 3, name: "Dewi Lestari", email: "dewi@metalabs.co.id", company: "MetaLabs Studio", tag: "Pelanggan", status: "Subscribed" },
                { id: 4, name: "Ahmad Rizky", email: "rizky@designhub.id", company: "DesignHub Nusantara", tag: "Lead", status: "Subscribed" },
                { id: 5, name: "Eko Prasetyo", email: "eko@vancemedia.com", company: "Vance Media", tag: "VIP", status: "Unsubscribed" },
                { id: 6, name: "Rina Wijaya", email: "rina@cyberdyne.id", company: "Cyberdyne Tech", tag: "Lead", status: "Bounced" }
            ],
            logs: [],
            template: {
                subject: "Selamat Datang di {{perusahaan}}, {{nama_depan}}! 🎉",
                senderName: "Tim MailBlast Indonesia",
                replyTo: "support@mailblast.id",
                body: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
  <h2 style="color: #2563eb;">Halo {{nama_depan}},</h2>
  <p>Terima kasih telah bergabung dengan <strong>{{perusahaan}}</strong>! Kami sangat senang dapat bermitra dengan Anda.</p>
  <p>Detail pendaftaran email Anda: <code>{{email}}</code></p>
  <p>Tanggal Bergabung: <strong>{{tanggal}}</strong></p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="font-size: 12px; color: #777;">Jika ada pertanyaan, Anda dapat langsung membalas email ini.</p>
</div>`
            },
            simulation: {
                running: false,
                paused: false,
                intervalId: null,
                queue: [],
                currentIndex: 0,
                total: 0,
                successCount: 0
            }
        };

        // References Grafik Chart.js
        let activityChart = null;
        let breakdownChart = null;

        // Inisialisasi Saat Halaman Dimuat
        window.onload = function() {
            lucide.createIcons();
            loadStateFromLocalStorage();
            updateLivePreview();
            renderContacts();
            renderAnalyticsLogs();
            updateDashboardStats();
            initCharts();
            switchTab('dashboard');
        };

        // LocalStorage Manager
        function saveStateToLocalStorage() {
            localStorage.setItem('mailblast_id_contacts', JSON.stringify(state.contacts));
            localStorage.setItem('mailblast_id_logs', JSON.stringify(state.logs));
            localStorage.setItem('mailblast_id_template', JSON.stringify(state.template));
        }

        function loadStateFromLocalStorage() {
            const savedContacts = localStorage.getItem('mailblast_id_contacts');
            const savedLogs = localStorage.getItem('mailblast_id_logs');
            const savedTpl = localStorage.getItem('mailblast_id_template');

            if (savedContacts) state.contacts = JSON.parse(savedContacts);
            if (savedLogs) state.logs = JSON.parse(savedLogs);
            if (savedTpl) {
                state.template = JSON.parse(savedTpl);
                document.getElementById('tpl-subject').value = state.template.subject;
                document.getElementById('tpl-sender-name').value = state.template.senderName;
                document.getElementById('tpl-reply-to').value = state.template.replyTo;
                document.getElementById('tpl-body').value = state.template.body;
            } else {
                document.getElementById('tpl-body').value = state.template.body;
            }
        }

        // Navigasi Tab
        function switchTab(tabId) {
            document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600/10', 'text-blue-400', 'border-r-2', 'border-blue-500');
            });

            const targetView = document.getElementById(`view-${tabId}`);
            if (targetView) targetView.classList.remove('hidden');

            const activeNav = document.getElementById(`nav-${tabId}`);
            if (activeNav) {
                activeNav.classList.add('bg-blue-600/10', 'text-blue-400', 'border-r-2', 'border-blue-500');
            }

            const titles = {
                dashboard: 'Ringkasan Dashboard',
                contacts: 'Daftar Kontak & Buku Alamat',
                campaigns: 'Editor Template & Kampanye Email',
                dispatch: 'Simulator Engine Pengiriman Massal',
                analytics: 'Laporan Performa & Log Pengiriman',
                settings: 'Konfigurasi Provider & Gateway SMTP',
                guide: 'Panduan Arsitektur Production Email Engine'
            };
            document.getElementById('page-title').innerText = titles[tabId] || 'MailBlast Indonesia';
        }

        // --- MANAJEMEN KONTAK ---
        function renderContacts() {
            const tbody = document.getElementById('contacts-table-body');
            const search = document.getElementById('contact-search').value.toLowerCase();
            const filter = document.getElementById('contact-filter-status').value;

            const filtered = state.contacts.filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.company.toLowerCase().includes(search);
                const matchesStatus = filter === 'all' || c.status === filter;
                return matchesSearch && matchesStatus;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Tidak ada kontak yang sesuai dengan kriteria.</td></tr>`;
                return;
            }

            tbody.innerHTML = filtered.map(c => `
                <tr class="hover:bg-slate-800/40">
                    <td class="p-3.5">
                        <div class="font-medium text-slate-200">${c.name}</div>
                        <div class="text-[11px] text-slate-400">${c.email}</div>
                    </td>
                    <td class="p-3.5 text-slate-300">${c.company || '-'}</td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">${c.tag}</span>
                    </td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.status === 'Subscribed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                            c.status === 'Unsubscribed' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                            'bg-rose-950 text-rose-400 border border-rose-800/50'
                        }">${c.status}</span>
                    </td>
                    <td class="p-3.5 text-right">
                        <button onclick="deleteContact(${c.id})" class="text-slate-500 hover:text-rose-400 p-1" title="Hapus Kontak"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </td>
                </tr>
            `).join('');

            lucide.createIcons();
            updateDashboardStats();
        }

        function handleAddContact(e) {
            e.preventDefault();
            const name = document.getElementById('input-contact-fn').value;
            const email = document.getElementById('input-contact-email').value;
            const company = document.getElementById('input-contact-company').value;
            const tag = document.getElementById('input-contact-tag').value;

            state.contacts.push({
                id: Date.now(),
                name, email, company, tag,
                status: 'Subscribed'
            });

            saveStateToLocalStorage();
            renderContacts();
            closeAddContactModal();
            showToast('Kontak baru berhasil disimpan!');
        }

        function deleteContact(id) {
            state.contacts = state.contacts.filter(c => c.id !== id);
            saveStateToLocalStorage();
            renderContacts();
            showToast('Kontak berhasil dihapus');
        }

        function openAddContactModal() { document.getElementById('modal-add-contact').classList.remove('hidden'); }
        function closeAddContactModal() { document.getElementById('modal-add-contact').classList.add('hidden'); }
        function openImportModal() { document.getElementById('modal-import').classList.remove('hidden'); }
        function closeImportModal() { document.getElementById('modal-import').classList.add('hidden'); }

        function processCSVImport() {
            const raw = document.getElementById('import-csv-text').value.trim();
            if (!raw) return;

            const lines = raw.split('\n');
            let addedCount = 0;

            lines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    state.contacts.push({
                        id: Date.now() + Math.random(),
                        name: parts[0].trim(),
                        email: parts[1].trim(),
                        company: parts[2] ? parts[2].trim() : 'N/A',
                        tag: parts[3] ? parts[3].trim() : 'Lead',
                        status: 'Subscribed'
                    });
                    addedCount++;
                }
            });

            saveStateToLocalStorage();
            renderContacts();
            closeImportModal();
            showToast(`Berhasil mengimpor ${addedCount} kontak!`);
        }

        // --- EDITOR TEMPLATE & PRATINJAU LANGSUNG ---
        function updateLivePreview() {
            const subject = document.getElementById('tpl-subject').value;
            const sender = document.getElementById('tpl-sender-name').value;
            let body = document.getElementById('tpl-body').value;

            const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

            body = body.replace(/\{\{nama_depan\}\}/g, 'Budi')
                       .replace(/\{\{nama_belakang\}\}/g, 'Santoso')
                       .replace(/\{\{perusahaan\}\}/g, 'PT Nexus Utama')
                       .replace(/\{\{email\}\}/g, 'budi.santoso@nexus.co.id')
                       .replace(/\{\{tanggal\}\}/g, today);

            document.getElementById('prev-subject-heading').innerText = subject;
            document.getElementById('prev-sender-display').innerText = sender;
            document.getElementById('preview-frame').innerHTML = body;
        }

        function insertTag(tag) {
            const area = document.getElementById('tpl-body');
            const start = area.selectionStart;
            const end = area.selectionEnd;
            area.value = area.value.substring(0, start) + tag + area.value.substring(end);
            updateLivePreview();
        }

        function setPreviewMode(mode) {
            const wrapper = document.getElementById('preview-wrapper');
            const btnD = document.getElementById('btn-prev-desktop');
            const btnM = document.getElementById('btn-prev-mobile');

            if (mode === 'mobile') {
                wrapper.classList.remove('max-w-full');
                wrapper.classList.add('max-w-[320px]');
                btnM.classList.add('bg-slate-800', 'text-white');
                btnD.classList.remove('bg-slate-800', 'text-white');
                btnD.classList.add('text-slate-400');
            } else {
                wrapper.classList.remove('max-w-[320px]');
                wrapper.classList.add('max-w-full');
                btnD.classList.add('bg-slate-800', 'text-white');
                btnM.classList.remove('bg-slate-800', 'text-white');
                btnM.classList.add('text-slate-400');
            }
        }

        function saveCurrentTemplate() {
            state.template = {
                subject: document.getElementById('tpl-subject').value,
                senderName: document.getElementById('tpl-sender-name').value,
                replyTo: document.getElementById('tpl-reply-to').value,
                body: document.getElementById('tpl-body').value
            };
            saveStateToLocalStorage();
            showToast('Template email berhasil disimpan!');
        }

        async function sendTestEmail() {
            const target = document.getElementById('test-email-input').value;
            if (!target) { showToast('Masukkan alamat email tujuan uji coba!'); return; }

            try {
                const response = await submitEmailBatch([{ email: target, name: '', company: '' }]);
                if (response.results[0]?.status === 'success') {
                    showToast(`Email uji coba berhasil dikirim ke ${target}`);
                } else {
                    showToast('Email uji coba gagal dikirim. Periksa konfigurasi backend.');
                }
            } catch (error) {
                showToast(error.message || 'Backend tidak dapat dihubungi.');
            }
        }

        async function submitEmailBatch(recipients) {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    subject: document.getElementById('tpl-subject').value,
                    htmlContent: document.getElementById('tpl-body').value,
                    senderName: document.getElementById('tpl-sender-name').value,
                    replyTo: document.getElementById('tpl-reply-to').value
                })
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || 'Pengiriman email gagal.');
            }

            return result;
        }

        function personalizeTemplate(value, recipient) {
            const names = (recipient.name || '').trim().split(/\s+/);
            const replacements = {
                nama_depan: names[0] || '',
                nama_belakang: names.slice(1).join(' '),
                perusahaan: recipient.company || '',
                email: recipient.email,
                tanggal: new Date().toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };

            return value.replace(/{{(nama_depan|nama_belakang|perusahaan|email|tanggal)}}/g, (_, key) => replacements[key]);
        }

        // --- SIMULATOR ENGINE PENGIRIMAN MASSAL ---
        function startDispatchSimulation() {
            if (state.simulation.running && !state.simulation.paused) return;

            if (state.simulation.paused) {
                state.simulation.paused = false;
                runDispatchTick();
                updateSimUI('BERJALAN');
                return;
            }

            const tagFilter = document.getElementById('sim-target-tag').value;
            let targetList = state.contacts.filter(c => c.status === 'Subscribed');
            if (tagFilter !== 'ALL') {
                targetList = targetList.filter(c => c.tag === tagFilter);
            }

            if (targetList.length === 0) {
                showToast('Tidak ada kontak aktif terikat tag ini!');
                return;
            }

            if (!window.confirm(`Kampanye ini akan mengirim email nyata kepada ${targetList.length} penerima. Lanjutkan?`)) {
                return;
            }

            state.simulation.queue = [...targetList];
            state.simulation.currentIndex = 0;
            state.simulation.total = targetList.length;
            state.simulation.successCount = 0;
            state.simulation.running = true;

            document.getElementById('console-terminal').innerHTML = `<div class="text-blue-400">// Memulai engine pengiriman massal ke ${targetList.length} penerima...</div>`;
            updateSimUI('BERJALAN');
            showSendingBadge(true);

            runDispatchTick();
        }

        async function runDispatchTick() {
            if (!state.simulation.running || state.simulation.paused) return;

            const batchSize = parseInt(document.getElementById('sim-batch-size').value) || 3;
            const delaySec = parseFloat(document.getElementById('sim-delay').value) || 1.5;

            const batch = state.simulation.queue.slice(state.simulation.currentIndex, state.simulation.currentIndex + batchSize);

            if (batch.length === 0) {
                finishSimulation();
                return;
            }

            let results = [];
            let batchError = '';
            try {
                const response = await submitEmailBatch(batch);
                results = response.results || [];
            } catch (error) {
                batchError = error.message;
            }

            let failedCount = 0;
            batch.forEach((recipient, index) => {
                const isSuccess = results[index]?.status === 'success';
                const statusCode = isSuccess ? 200 : 500;
                const statusStr = isSuccess ? 'Sent' : 'Failed';

                if (isSuccess) state.simulation.successCount++;
                else failedCount++;

                const logEntry = {
                    timestamp: new Date().toLocaleTimeString('id-ID'),
                    email: recipient.email,
                    subject: personalizeTemplate(document.getElementById('tpl-subject').value, recipient),
                    status: statusStr,
                    code: statusCode
                };

                state.logs.unshift(logEntry);
                appendTerminalLog(logEntry);
            });

            if (failedCount > 0) {
                showToast(batchError || `${failedCount} email gagal dikirim. Periksa log dan konfigurasi backend.`);
            }

            state.simulation.currentIndex += batch.length;
            updateProgressMetrics();

            saveStateToLocalStorage();
            renderAnalyticsLogs();
            updateDashboardStats();

            if (state.simulation.running && !state.simulation.paused) {
                state.simulation.intervalId = setTimeout(() => {
                    runDispatchTick();
                }, delaySec * 1000);
            }
        }

        function pauseDispatchSimulation() {
            state.simulation.paused = true;
            clearTimeout(state.simulation.intervalId);
            updateSimUI('DIJEDA');
            appendTerminalLog({ timestamp: new Date().toLocaleTimeString('id-ID'), email: 'SISTEM', status: 'Pengiriman dijeda pengguna', code: '---' });
        }

        function stopDispatchSimulation() {
            state.simulation.running = false;
            state.simulation.paused = false;
            clearTimeout(state.simulation.intervalId);
            updateSimUI('DIBATALKAN');
            showSendingBadge(false);
            appendTerminalLog({ timestamp: new Date().toLocaleTimeString('id-ID'), email: 'SISTEM', status: 'Pengiriman dibatalkan', code: '---' });
        }

        function finishSimulation() {
            state.simulation.running = false;
            showSendingBadge(false);
            updateSimUI('SELESAI');
            showToast(`Kampanye selesai: ${state.simulation.successCount} dari ${state.simulation.total} email diterima provider.`);
            appendTerminalLog({ timestamp: new Date().toLocaleTimeString('id-ID'), email: 'SISTEM', status: 'SELESAI - Semua email diproses', code: 200 });
        }

        function updateProgressMetrics() {
            const current = state.simulation.currentIndex;
            const total = state.simulation.total;
            const percent = total > 0 ? Math.round((current / total) * 100) : 0;
            const rate = current > 0 ? Math.round((state.simulation.successCount / current) * 100) : 100;

            document.getElementById('sim-progress-bar').style.width = `${percent}%`;
            document.getElementById('sim-progress-percent').innerText = `${percent}%`;
            document.getElementById('queue-progress-text').innerText = `${current} / ${total}`;
            document.getElementById('queue-success-rate').innerText = `${rate}%`;
        }

        function appendTerminalLog(log) {
            const term = document.getElementById('console-terminal');
            const colorClass = log.code === 200 ? 'text-emerald-400' : log.code === '---' ? 'text-amber-400' : 'text-rose-400';
            const logRow = `<div class="font-mono text-[11px]"><span class="text-slate-500">[${log.timestamp}]</span> Mengirim ke <span class="text-slate-200">${log.email}</span> ... <span class="${colorClass}">${log.status} [${log.code}]</span></div>`;
            term.innerHTML += logRow;
            term.scrollTop = term.scrollHeight;
        }

        function updateSimUI(status) {
            const btnStart = document.getElementById('btn-start-sim');
            const btnPause = document.getElementById('btn-pause-sim');
            const btnStop = document.getElementById('btn-stop-sim');
            const statusPill = document.getElementById('sim-status-pill');

            statusPill.innerText = status;

            if (status === 'BERJALAN') {
                btnStart.disabled = true;
                btnPause.disabled = false;
                btnStop.disabled = false;
                statusPill.className = "text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono animate-pulse";
            } else if (status === 'DIJEDA') {
                btnStart.disabled = false;
                btnPause.disabled = true;
                statusPill.className = "text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-mono";
            } else {
                btnStart.disabled = false;
                btnPause.disabled = true;
                btnStop.disabled = true;
                statusPill.className = "text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono";
            }
        }

        function showSendingBadge(show) {
            const badge = document.getElementById('sending-badge');
            if (show) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }

        // --- ANALYTICS & LOGS ---
        function renderAnalyticsLogs() {
            const tbody = document.getElementById('analytics-logs-body');
            const search = document.getElementById('log-search').value.toLowerCase();
            const filter = document.getElementById('log-filter-status').value;

            const filtered = state.logs.filter(l => {
                const matchesSearch = l.email.toLowerCase().includes(search) || l.subject.toLowerCase().includes(search);
                const matchesStatus = filter === 'all' || l.status === filter;
                return matchesSearch && matchesStatus;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Belum ada catatan log pengiriman.</td></tr>`;
                return;
            }

            tbody.innerHTML = filtered.map(l => `
                <tr class="hover:bg-slate-800/40">
                    <td class="p-3.5 text-slate-400 font-mono text-[11px]">${l.timestamp}</td>
                    <td class="p-3.5 font-medium text-slate-200">${l.email}</td>
                    <td class="p-3.5 text-slate-300 truncate max-w-xs">${l.subject}</td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ['Sent', 'Delivered'].includes(l.status) ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                        }">${l.status}</span>
                    </td>
                    <td class="p-3.5 font-mono text-slate-400">${l.code}</td>
                </tr>
            `).join('');
        }

        function clearLogs() {
            state.logs = [];
            saveStateToLocalStorage();
            renderAnalyticsLogs();
            updateDashboardStats();
            showToast('Riwayat log berhasil dibersihkan');
        }

        function exportLogs(format) {
            if (state.logs.length === 0) { showToast('Tidak ada data log untuk diekspor'); return; }

            let content = "";
            let fileName = `laporan_email_${Date.now()}`;

            if (format === 'csv') {
                content = "Stempel Waktu,Penerima,Subjek,Status,Kode HTTP\n" + 
                    state.logs.map(l => `"${l.timestamp}","${l.email}","${l.subject}","${l.status}","${l.code}"`).join('\n');
                fileName += ".csv";
            }

            const blob = new Blob([content], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            showToast('Berkas laporan berhasil diunduh');
        }

        // --- DASHBOARD METRICS & CHARTS ---
        function updateDashboardStats() {
            document.getElementById('stat-contacts-count').innerText = state.contacts.length;
            document.getElementById('stat-sent-count').innerText = state.logs.length;

            const failedLogs = state.logs.filter(l => l.status === 'Failed').length;
            document.getElementById('stat-failed-count').innerText = failedLogs;

            const successLogs = state.logs.filter(l => ['Sent', 'Delivered'].includes(l.status)).length;
            const rate = state.logs.length > 0 ? Math.round((successLogs / state.logs.length) * 100) : 100;
            document.getElementById('stat-delivery-rate').innerText = `${rate}%`;

            const recentContainer = document.getElementById('dashboard-recent-logs');
            const recent = state.logs.slice(0, 4);

            if (recent.length === 0) {
                recentContainer.innerHTML = `<p class="text-slate-500">Belum ada riwayat aktivitas pengiriman.</p>`;
                return;
            }

            recentContainer.innerHTML = recent.map(r => `
                <div class="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full ${['Sent', 'Delivered'].includes(r.status) ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
                        <span class="font-medium text-slate-300">${r.email}</span>
                    </div>
                    <span class="text-slate-500 text-[10px] font-mono">${r.timestamp}</span>
                </div>
            `).join('');
        }

        function initCharts() {
            const ctx1 = document.getElementById('chart-activity').getContext('2d');
            activityChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                    datasets: [{
                        label: 'Email Terkirim',
                        data: [150, 230, 180, 310, 450, 210, 380],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
                        y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } }
                    }
                }
            });

            const ctx2 = document.getElementById('chart-breakdown').getContext('2d');
            breakdownChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Terkirim (Delivered)', 'Dibuka (Opened)', 'Gagal (Bounced)'],
                    datasets: [{
                        data: [78, 18, 4],
                        backgroundColor: ['#10b981', '#3b82f6', '#f43f5e'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } }
                }
            });
        }

        // --- SYSTEM TOAST NOTIFICATIONS ---
        function showToast(message) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto';
            toast.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-blue-400"></i> ${message}`;
            
            container.appendChild(toast);
            lucide.createIcons();

            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function toggleMobileMenu() {
            const sidebar = document.querySelector('aside');
            sidebar.classList.toggle('hidden');
        }
