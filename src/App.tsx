import { useState } from 'react';

interface LoanInput {
    loanBalance: number;
    interestRate: number;
    repaymentTerm: 10 | 15 | 20 | 25;
    incomeLevel: 'under50k' | '50k-75k' | '75k-100k' | 'over100k';
    forgivenessProgram: boolean;
}

const INCOME_FACTOR: Record<string, number> = { 'under50k': 0.10, '50k-75k': 0.12, '75k-100k': 0.15, 'over100k': 0.18 };
const FORGIVENESS_YEARS = 10;
const FORGIVENESS_PAYMENTS = 120;

const REPAYMENT_TIPS: string[] = [
    'Standard repayment minimizes total interest',
    'Income-driven plans may lower monthly payments',
    'PSLF requires 120 qualifying payments',
    'Review options annually as income changes'
];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function App() {
    const [values, setValues] = useState<LoanInput>({ loanBalance: 45000, interestRate: 6.5, repaymentTerm: 10, incomeLevel: '50k-75k', forgivenessProgram: false });
    const handleChange = (field: keyof LoanInput, value: string | number | boolean) => setValues(prev => ({ ...prev, [field]: value }));

    const monthlyRate = values.interestRate / 100 / 12;
    const totalPayments = values.repaymentTerm * 12;

    const standardMonthly = monthlyRate > 0
        ? Math.round((values.loanBalance * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1))
        : Math.round(values.loanBalance / totalPayments);

    const standardTotal = standardMonthly * totalPayments;

    let estimatedMonthly = standardMonthly;
    let estimatedTotal = standardTotal;
    let forgivenAmount = 0;

    if (values.forgivenessProgram) {
        const incomeFactor = INCOME_FACTOR[values.incomeLevel];
        const incomeBasedMonthly = Math.round(values.loanBalance * incomeFactor / 12);
        estimatedMonthly = Math.min(standardMonthly, incomeBasedMonthly);

        const paidBeforeForgiveness = estimatedMonthly * FORGIVENESS_PAYMENTS;
        const remainingBalance = Math.max(0, values.loanBalance + (values.loanBalance * (values.interestRate / 100) * FORGIVENESS_YEARS) - paidBeforeForgiveness);
        forgivenAmount = Math.round(remainingBalance * 0.85);
        estimatedTotal = paidBeforeForgiveness;
    }

    const breakdownData = [
        { label: 'Standard Repayment', value: fmt(standardTotal), isTotal: false },
        { label: 'Forgiveness Adjustment', value: values.forgivenessProgram ? `-${fmt(forgivenAmount)}` : '$0', isTotal: false },
        { label: 'Estimated Final Cost', value: fmt(estimatedTotal), isTotal: true }
    ];

    return (
        <main style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <header style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Student Loan Payment Estimator (2026)</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Estimate monthly payments with forgiveness options</p>
            </header>

            <div className="card">
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label htmlFor="loanBalance">Loan Balance ($)</label>
                            <input id="loanBalance" type="number" min="1000" max="500000" step="1000" value={values.loanBalance || ''} onChange={(e) => handleChange('loanBalance', parseInt(e.target.value) || 0)} placeholder="45000" />
                        </div>
                        <div>
                            <label htmlFor="interestRate">Interest Rate (%)</label>
                            <input id="interestRate" type="number" min="0" max="15" step="0.1" value={values.interestRate || ''} onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)} placeholder="6.5" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label htmlFor="repaymentTerm">Repayment Term</label>
                            <select id="repaymentTerm" value={values.repaymentTerm} onChange={(e) => handleChange('repaymentTerm', parseInt(e.target.value))}>
                                <option value="10">10 years</option>
                                <option value="15">15 years</option>
                                <option value="20">20 years</option>
                                <option value="25">25 years</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="incomeLevel">Income Level</label>
                            <select id="incomeLevel" value={values.incomeLevel} onChange={(e) => handleChange('incomeLevel', e.target.value)}>
                                <option value="under50k">Under $50,000</option>
                                <option value="50k-75k">$50,000 - $75,000</option>
                                <option value="75k-100k">$75,000 - $100,000</option>
                                <option value="over100k">Over $100,000</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                        <input id="forgivenessProgram" type="checkbox" checked={values.forgivenessProgram} onChange={(e) => handleChange('forgivenessProgram', e.target.checked)} />
                        <label htmlFor="forgivenessProgram" style={{ margin: 0, cursor: 'pointer' }}>Include Forgiveness Program (e.g., PSLF)</label>
                    </div>
                    <button className="btn-primary" type="button">Calculate Payment</button>
                </div>
            </div>

            <div className="card" style={{ background: '#F0F9FF', borderColor: '#BAE6FD' }}>
                <div className="text-center">
                    <h2 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Estimated Monthly Payment</h2>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{fmt(estimatedMonthly)}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>per month</div>
                </div>
                <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px solid #BAE6FD' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOTAL PAID</div>
                        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{fmt(estimatedTotal)}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #BAE6FD', paddingLeft: 'var(--space-4)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>FORGIVEN AMOUNT</div>
                        <div style={{ fontWeight: 700, fontSize: '1.25rem', color: forgivenAmount > 0 ? '#16A34A' : 'var(--color-text-primary)' }}>{fmt(forgivenAmount)}</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>Repayment Considerations</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
                    {REPAYMENT_TIPS.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />{item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="ad-container"><span>Advertisement</span></div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1rem' }}>Payment Breakdown</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                    <tbody>
                        {breakdownData.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i === breakdownData.length - 1 ? 'none' : '1px solid var(--color-border)', backgroundColor: row.isTotal ? '#F0F9FF' : (i % 2 ? '#F8FAFC' : 'transparent') }}>
                                <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-text-secondary)', fontWeight: row.isTotal ? 600 : 400 }}>{row.label}</td>
                                <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontWeight: 600, color: row.isTotal ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{row.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <p>This tool provides informational estimates of student loan payments using simplified assumptions. Forgiveness calculations are approximations and actual program requirements vary. The figures shown are estimates only and do not constitute student loan or legal advice. Actual payments depend on loan servicer terms, program eligibility, and federal regulations. Consult your loan servicer or a financial advisor for personalized guidance.</p>
            </div>

            <footer style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-8)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-4)', fontSize: '0.875rem' }}>
                    <li>• Estimates only</li><li>• Simplified assumptions</li><li>• Free to use</li>
                </ul>
                <nav style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                    <a href="https://scenariocalculators.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Privacy Policy</a>
                    <span style={{ color: '#64748B' }}>|</span>
                    <a href="https://scenariocalculators.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Terms of Service</a>
                </nav>
                <p style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem' }}>&copy; 2026 Student Loan Payment Estimator</p>
            </footer>

            <div className="ad-container ad-sticky"><span>Advertisement</span></div>
        </main>
    );
}

export default App;
